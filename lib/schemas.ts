import { z } from "zod";

// ObjectId as 24-hex string
export const objectIdZ = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "invalid ObjectId");

// Common
const createdAtZ = z.coerce.date();

// Users
export const UserZ = z.object({
    _id: objectIdZ.optional(),
    username: z.string().min(3).max(32),
    email: z.string().email(),
    password: z.string().min(8).max(200),
    createdAt: createdAtZ.default(() => new Date()),
});
export type User = z.infer<typeof UserZ>;

// Posts
export const PostZ = z.object({
    _id: objectIdZ.optional(),
    userId: objectIdZ,
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    likes: z.number().int().min(0).default(0),
    createdAt: createdAtZ.default(() => new Date()),
});
export type Post = z.infer<typeof PostZ>;

// Comments
export const CommentZ = z.object({
    _id: objectIdZ.optional(),
    postId: objectIdZ,
    userId: objectIdZ,
    content: z.string().min(1).max(1000),
    createdAt: createdAtZ.default(() => new Date()),
});
export type Comment = z.infer<typeof CommentZ>;

// Arrays
export const UsersArrayZ = z.array(UserZ);
export const PostsArrayZ = z.array(PostZ);
export const CommentsArrayZ = z.array(CommentZ);

// DTO schemas
export const CreateUserZ = UserZ.omit({ _id: true, createdAt: true });
export const UpdateUserZ = CreateUserZ.partial();

export const CreatePostZ = PostZ.omit({ _id: true, createdAt: true, likes: true }).extend({
    likes: z.number().int().min(0).optional(),
});
export const UpdatePostZ = CreatePostZ.partial();

export const CreateCommentZ = CommentZ.omit({ _id: true, createdAt: true });
export const UpdateCommentZ = CreateCommentZ.partial();
