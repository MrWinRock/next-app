import { notFound } from "next/navigation";
import Link from "next/link";
import { listUsers, getPost, getUser, listCommentsByPost } from "@/lib/data";
import { CommentForm } from "@/app/components/CommentForm";

export default async function PostDetail({ params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    if (!post) return notFound();
    const [author, comments, users] = await Promise.all([
        getUser(post.userId),
        listCommentsByPost(post._id!),
        listUsers(),
    ]);

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="mx-auto max-w-3xl p-6 sm:p-10">
                <Link href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">← Back</Link>
                <article className="mt-4 rounded border p-4 bg-white/70 dark:bg-zinc-900/40">
                    <h1 className="text-2xl font-semibold text-black dark:text-white">{post.title}</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        by {author?.username ?? "Unknown"} · {post.createdAt.toLocaleString()} · {post.likes} likes
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-black dark:text-zinc-100">{post.content}</p>
                </article>

                <section className="mt-8">
                    <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">Comments</h2>
                    {comments.length === 0 ? (
                        <p className="text-zinc-600 dark:text-zinc-400">No comments yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {comments.map((c) => {
                                const u = users.find((x) => x._id === c.userId);
                                return (
                                    <li key={c._id} className="rounded border p-3 bg-white/70 dark:bg-zinc-900/40">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            <span className="font-medium">{u?.username ?? "Unknown"}</span> · {c.createdAt.toLocaleString()}
                                        </p>
                                        <p className="mt-1">{c.content}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <div className="mt-6">
                    <CommentForm postId={post._id!} users={users.map((u) => ({ _id: u._id!, username: u.username }))} />
                </div>
            </main>
        </div>
    );
}
