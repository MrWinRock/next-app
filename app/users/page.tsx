import Link from "next/link";
import { listUsers, listPosts } from "@/lib/data";

export default async function UsersPage() {
    const [users, posts] = await Promise.all([listUsers(), listPosts()]);
    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="mx-auto max-w-3xl p-6 sm:p-10">
                <div className="flex items-baseline justify-between gap-4">
                    <h1 className="text-3xl font-semibold text-black dark:text-white">Users</h1>
                    <Link href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">Home</Link>
                </div>

                {users.length === 0 ? (
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">No users yet. Create one on the home page.</p>
                ) : (
                    <ul className="mt-6 space-y-3">
                        {users.map((u) => {
                            const count = posts.filter((p) => p.userId === u._id).length;
                            return (
                                <li key={u._id} className="rounded border p-3 bg-white/70 dark:bg-zinc-900/40">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-black dark:text-white">{u.username}</p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{u.email}</p>
                                        </div>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">{count} posts</div>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">Joined {u.createdAt.toLocaleString()}</p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </div>
    );
}
