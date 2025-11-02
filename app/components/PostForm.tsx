"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserOption = { _id: string; username: string };

export function PostForm({ users }: { users: UserOption[] }) {
    const r = useRouter();
    const [userId, setUserId] = useState(users[0]?._id ?? "");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!userId) throw new Error("Select a user");
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, title, content }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `Failed (${res.status})`);
            }
            setTitle("");
            setContent("");
            r.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 border p-3 rounded-md bg-white/60 dark:bg-zinc-900/40">
            <h3 className="font-semibold">Create Post</h3>
            <select
                aria-label="Author"
                className="rounded border px-2 py-1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            >
                {users.map((u) => (
                    <option key={u._id} value={u._id}>
                        {u.username}
                    </option>
                ))}
            </select>
            <input
                className="rounded border px-2 py-1"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
            />
            <textarea
                className="rounded border px-2 py-1"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={loading || !userId}
                className="rounded bg-black text-white px-3 py-1 disabled:opacity-50 dark:bg-white dark:text-black"
            >
                {loading ? "Posting..." : "Create Post"}
            </button>
        </form>
    );
}
