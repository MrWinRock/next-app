import Link from "next/link";
import { listComments, listUsers, listPosts } from "@/lib/data";

export default async function CommentsPage() {
    const [comments, users, posts] = await Promise.all([listComments(), listUsers(), listPosts()]);
    const usersById = new Map(users.map((u) => [u._id!, u]));
    const postsById = new Map(posts.map((p) => [p._id!, p]));

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="mx-auto max-w-3xl p-6 sm:p-10">
                <div className="flex items-baseline justify-between gap-4">
                    <h1 className="text-3xl font-semibold text-black dark:text-white">Comments</h1>
                    <Link href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">Home</Link>
                </div>

                {comments.length === 0 ? (
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">No comments yet.</p>
                ) : (
                    <ul className="mt-6 space-y-3">
                        {comments.map((c) => {
                            const user = usersById.get(c.userId);
                            const post = postsById.get(c.postId);
                            return (
                                <li key={c._id} className="rounded border p-3 bg-white/70 dark:bg-zinc-900/40">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="font-medium">{user?.username ?? "Unknown"}</span>
                                        {" on "}
                                        {post ? (
                                            <Link className="underline" href={`/posts/${post._id}`}>{post.title}</Link>
                                        ) : (
                                            <span>Unknown post</span>
                                        )}
                                        {" · "}
                                        {c.createdAt.toLocaleString()}
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </div>
    );
}
