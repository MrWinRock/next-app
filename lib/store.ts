import "server-only";
import { z } from "zod";
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
import { newObjectId } from "./id";

// In-memory store (dev/demo only)
class Store {
    private users: User[] = [];
    private posts: Post[] = [];
    private comments: Comment[] = [];

    // Users
    listUsers(): User[] {
        return [...this.users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    getUser(id: string): User | undefined {
        return this.users.find((u) => u._id === id);
    }
    createUser(input: z.infer<typeof CreateUserZ>): User {
        const parsed = CreateUserZ.parse(input);
        const user: User = UserZ.parse({ ...parsed, _id: newObjectId(), createdAt: new Date() });
        this.users.push(user);
        return user;
    }
    updateUser(id: string, patch: z.infer<typeof UpdateUserZ>): User {
        const idx = this.users.findIndex((u) => u._id === id);
        if (idx === -1) throw new Error("User not found");
        const merged = { ...this.users[idx], ...UpdateUserZ.parse(patch) };
        const updated = UserZ.parse(merged);
        this.users[idx] = updated;
        return updated;
    }
    deleteUser(id: string): boolean {
        const before = this.users.length;
        this.users = this.users.filter((u) => u._id !== id);
        // Also remove their posts and comments
        const userPosts = this.posts.filter((p) => p.userId === id).map((p) => p._id!).filter(Boolean);
        this.posts = this.posts.filter((p) => p.userId !== id);
        this.comments = this.comments.filter((c) => c.userId !== id && !userPosts.includes(c.postId));
        return this.users.length !== before;
    }

    // Posts
    listPosts(): Post[] {
        return [...this.posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    getPost(id: string): Post | undefined {
        return this.posts.find((p) => p._id === id);
    }
    createPost(input: z.infer<typeof CreatePostZ>): Post {
        const parsed = CreatePostZ.parse(input);
        // FK: user must exist
        if (!this.getUser(parsed.userId)) throw new Error("userId does not exist");
        const post: Post = PostZ.parse({ ...parsed, _id: newObjectId(), createdAt: new Date(), likes: parsed.likes ?? 0 });
        this.posts.push(post);
        return post;
    }
    updatePost(id: string, patch: z.infer<typeof UpdatePostZ>): Post {
        const idx = this.posts.findIndex((p) => p._id === id);
        if (idx === -1) throw new Error("Post not found");
        const merged = { ...this.posts[idx], ...UpdatePostZ.parse(patch) };
        const updated = PostZ.parse(merged);
        // FK if userId changed
        if (updated.userId !== this.posts[idx].userId && !this.getUser(updated.userId)) {
            throw new Error("userId does not exist");
        }
        this.posts[idx] = updated;
        return updated;
    }
    deletePost(id: string): boolean {
        const before = this.posts.length;
        this.posts = this.posts.filter((p) => p._id !== id);
        this.comments = this.comments.filter((c) => c.postId !== id);
        return this.posts.length !== before;
    }

    // Comments
    listComments(): Comment[] {
        return [...this.comments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    listCommentsByPost(postId: string): Comment[] {
        return this.comments
            .filter((c) => c.postId === postId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    getComment(id: string): Comment | undefined {
        return this.comments.find((c) => c._id === id);
    }
    createComment(input: z.infer<typeof CreateCommentZ>): Comment {
        const parsed = CreateCommentZ.parse(input);
        if (!this.getPost(parsed.postId)) throw new Error("postId does not exist");
        if (!this.getUser(parsed.userId)) throw new Error("userId does not exist");
        const comment: Comment = CommentZ.parse({ ...parsed, _id: newObjectId(), createdAt: new Date() });
        this.comments.push(comment);
        return comment;
    }
    updateComment(id: string, patch: z.infer<typeof UpdateCommentZ>): Comment {
        const idx = this.comments.findIndex((c) => c._id === id);
        if (idx === -1) throw new Error("Comment not found");
        const merged = { ...this.comments[idx], ...UpdateCommentZ.parse(patch) };
        const updated = CommentZ.parse(merged);
        // FK checks if changed
        if (
            (updated.postId !== this.comments[idx].postId && !this.getPost(updated.postId)) ||
            (updated.userId !== this.comments[idx].userId && !this.getUser(updated.userId))
        ) {
            throw new Error("Invalid foreign key");
        }
        this.comments[idx] = updated;
        return updated;
    }
    deleteComment(id: string): boolean {
        const before = this.comments.length;
        this.comments = this.comments.filter((c) => c._id !== id);
        return this.comments.length !== before;
    }
}

// Singleton store instance
export const store = new Store();
