import "server-only";
import { z } from "zod";
import { getDb, toObjectId, idToString } from "./mongo";
import type { ObjectId, WithId } from "mongodb";
import {
    UserZ,
    PostZ,
    CommentZ,
    CreateUserZ,
    UpdateUserZ,
    CreatePostZ,
    UpdatePostZ,
    CreateCommentZ,
    UpdateCommentZ,
    type User,
    type Post,
    type Comment,
} from "./schemas";

// Helper to support different driver return typings (value vs direct doc)
function hasValue<T>(res: unknown): res is { value: WithId<T> | null } {
    return typeof res === "object" && res !== null && "value" in (res as Record<string, unknown>);
}

function zparse<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
    const result = schema.safeParse(value);
    if (!result.success) {
        // Re-throw as a plain Error to avoid Next/React trying to override ZodError.message (getter-only)
        throw new Error(result.error.message);
    }
    return result.data;
}

// USERS
export async function listUsers(): Promise<User[]> {
    const db = await getDb();
    const docs = await db.collection<UserDoc>("users").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(mapUserDoc);
}
export async function getUser(id: string): Promise<User | undefined> {
    const db = await getDb();
    const doc = await db.collection<UserDoc>("users").findOne({ _id: toObjectId(id) });
    return doc ? mapUserDoc(doc) : undefined;
}
export async function createUser(input: z.infer<typeof CreateUserZ>): Promise<User> {
    const db = await getDb();
    const parsed = CreateUserZ.parse(input);
    const now = new Date();
    const res = await db.collection<UserDoc>("users").insertOne({ ...parsed, createdAt: now });
    const doc = await db.collection<UserDoc>("users").findOne({ _id: res.insertedId });
    return mapUserDoc(doc!);
}
export async function updateUser(id: string, patch: z.infer<typeof UpdateUserZ>): Promise<User> {
    const db = await getDb();
    const parsed = UpdateUserZ.parse(patch);
    const updated = await db
        .collection<UserDoc>("users")
        .findOneAndUpdate({ _id: toObjectId(id) }, { $set: parsed }, { returnDocument: "after" });
    const val = hasValue<UserDoc>(updated) ? updated.value : (updated as WithId<UserDoc> | null);
    if (!val) throw new Error("User not found");
    return mapUserDoc(val);
}
export async function deleteUser(id: string): Promise<boolean> {
    const db = await getDb();
    // Cascade delete: posts and comments by this user
    const posts = await db
        .collection<{ _id: ObjectId }>("posts")
        .find({ userId: id })
        .project({ _id: 1 })
        .toArray();
    const postIds = posts.map((p) => p._id.toHexString());
    await db.collection("comments").deleteMany({ $or: [{ userId: id }, { postId: { $in: postIds } }] });
    await db.collection("posts").deleteMany({ userId: id });
    const res = await db.collection("users").deleteOne({ _id: toObjectId(id) });
    return res.deletedCount === 1;
}

// POSTS
export async function listPosts(): Promise<Post[]> {
    const db = await getDb();
    const docs = await db.collection<PostDoc>("posts").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(mapPostDoc);
}
export async function getPost(id: string): Promise<Post | undefined> {
    const db = await getDb();
    const doc = await db.collection<PostDoc>("posts").findOne({ _id: toObjectId(id) });
    return doc ? mapPostDoc(doc) : undefined;
}
export async function createPost(input: z.infer<typeof CreatePostZ>): Promise<Post> {
    const db = await getDb();
    const parsed = CreatePostZ.parse(input);
    // FK: user must exist
    const user = await db.collection<UserDoc>("users").findOne({ _id: toObjectId(parsed.userId) });
    if (!user) throw new Error("userId does not exist");
    const now = new Date();
    const likes = parsed.likes ?? 0;
    const res = await db.collection<PostDoc>("posts").insertOne({ ...parsed, createdAt: now, likes });
    const doc = await db.collection<PostDoc>("posts").findOne({ _id: res.insertedId });
    return mapPostDoc(doc!);
}
export async function updatePost(id: string, patch: z.infer<typeof UpdatePostZ>): Promise<Post> {
    const db = await getDb();
    const parsed = UpdatePostZ.parse(patch);
    if (parsed.userId) {
        const user = await db.collection<UserDoc>("users").findOne({ _id: toObjectId(parsed.userId) });
        if (!user) throw new Error("userId does not exist");
    }
    const updated = await db
        .collection<PostDoc>("posts")
        .findOneAndUpdate({ _id: toObjectId(id) }, { $set: parsed }, { returnDocument: "after" });
    const val = hasValue<PostDoc>(updated) ? updated.value : (updated as WithId<PostDoc> | null);
    if (!val) throw new Error("Post not found");
    return mapPostDoc(val);
}
export async function deletePost(id: string): Promise<boolean> {
    const db = await getDb();
    await db.collection<CommentDoc>("comments").deleteMany({ postId: id });
    const res = await db.collection<PostDoc>("posts").deleteOne({ _id: toObjectId(id) });
    return res.deletedCount === 1;
}

// COMMENTS
export async function listComments(): Promise<Comment[]> {
    const db = await getDb();
    const docs = await db.collection<CommentDoc>("comments").find({}).sort({ createdAt: 1 }).toArray();
    return docs.map(mapCommentDoc);
}
export async function listCommentsByPost(postId: string): Promise<Comment[]> {
    const db = await getDb();
    const docs = await db.collection<CommentDoc>("comments").find({ postId }).sort({ createdAt: 1 }).toArray();
    return docs.map(mapCommentDoc);
}
export async function getComment(id: string): Promise<Comment | undefined> {
    const db = await getDb();
    const doc = await db.collection<CommentDoc>("comments").findOne({ _id: toObjectId(id) });
    return doc ? mapCommentDoc(doc) : undefined;
}
export async function createComment(input: z.infer<typeof CreateCommentZ>): Promise<Comment> {
    const db = await getDb();
    const parsed = CreateCommentZ.parse(input);
    const post = await db.collection<PostDoc>("posts").findOne({ _id: toObjectId(parsed.postId) });
    if (!post) throw new Error("postId does not exist");
    const user = await db.collection<UserDoc>("users").findOne({ _id: toObjectId(parsed.userId) });
    if (!user) throw new Error("userId does not exist");
    const now = new Date();
    const res = await db.collection<CommentDoc>("comments").insertOne({ ...parsed, createdAt: now });
    const doc = await db.collection<CommentDoc>("comments").findOne({ _id: res.insertedId });
    return mapCommentDoc(doc!);
}
export async function updateComment(id: string, patch: z.infer<typeof UpdateCommentZ>): Promise<Comment> {
    const db = await getDb();
    const parsed = UpdateCommentZ.parse(patch);
    if (parsed.postId) {
        const post = await db.collection<PostDoc>("posts").findOne({ _id: toObjectId(parsed.postId) });
        if (!post) throw new Error("postId does not exist");
    }
    if (parsed.userId) {
        const user = await db.collection<UserDoc>("users").findOne({ _id: toObjectId(parsed.userId) });
        if (!user) throw new Error("userId does not exist");
    }
    const updated = await db
        .collection<CommentDoc>("comments")
        .findOneAndUpdate({ _id: toObjectId(id) }, { $set: parsed }, { returnDocument: "after" });
    const val = hasValue<CommentDoc>(updated) ? updated.value : (updated as WithId<CommentDoc> | null);
    if (!val) throw new Error("Comment not found");
    return mapCommentDoc(val);
}
export async function deleteComment(id: string): Promise<boolean> {
    const db = await getDb();
    const res = await db.collection<CommentDoc>("comments").deleteOne({ _id: toObjectId(id) });
    return res.deletedCount === 1;
}

// MAPPERS
type UserDoc = { username: string; email: string; password: string; createdAt: Date | string };
type PostDoc = { userId: string | ObjectId; title: string; content: string; likes?: number; createdAt: Date | string };
type CommentDoc = { postId: string | ObjectId; userId: string | ObjectId; content: string; createdAt: Date | string };

function mapUserDoc(doc: WithId<UserDoc>): User {
    return zparse(UserZ, {
        _id: idToString(doc._id),
        username: doc.username,
        email: doc.email,
        password: doc.password,
        createdAt: new Date(doc.createdAt),
    });
}
function mapPostDoc(doc: WithId<PostDoc>): Post {
    return zparse(PostZ, {
        _id: idToString(doc._id),
        userId: typeof doc.userId === "string" ? doc.userId : idToString(doc.userId),
        title: doc.title,
        content: doc.content,
        likes: doc.likes ?? 0,
        createdAt: new Date(doc.createdAt),
    });
}
function mapCommentDoc(doc: WithId<CommentDoc>): Comment {
    return zparse(CommentZ, {
        _id: idToString(doc._id),
        postId: typeof doc.postId === "string" ? doc.postId : idToString(doc.postId),
        userId: typeof doc.userId === "string" ? doc.userId : idToString(doc.userId),
        content: doc.content,
        createdAt: new Date(doc.createdAt),
    });
}
