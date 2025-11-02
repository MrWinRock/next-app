import Link from "next/link";
import { listUsers, listPosts } from "@/lib/data";
import { UserForm } from "./components/UserForm";
import { PostForm } from "./components/PostForm";

export default async function Home() {
  const [users, posts] = await Promise.all([listUsers(), listPosts()]);
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-3xl p-6 sm:p-10">
        <h1 className="text-3xl font-semibold mb-2 text-black dark:text-white">Mini Blog</h1>
        <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 flex gap-4">
          <Link className="underline" href="/users">Users</Link>
          <Link className="underline" href="/comments">Comments</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UserForm />
          <PostForm users={users.map((u) => ({ _id: u._id!, username: u.username }))} />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">No posts yet. Create a user and add your first post.</p>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p._id} className="rounded border p-3 bg-white/70 dark:bg-zinc-900/40">
                  <Link className="text-lg font-medium underline" href={`/posts/${p._id}`}>
                    {p.title}
                  </Link>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{p.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
