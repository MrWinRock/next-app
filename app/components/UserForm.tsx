"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserForm() {
    const r = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `Failed (${res.status})`);
            }
            setUsername("");
            setEmail("");
            setPassword("");
            r.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 border p-3 rounded-md bg-white/60 dark:bg-zinc-900/40">
            <h3 className="font-semibold">Create User</h3>
            <input
                className="rounded border px-2 py-1"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
            />
            <input
                type="email"
                className="rounded border px-2 py-1"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                className="rounded border px-2 py-1"
                placeholder="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={200}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="rounded bg-black text-white px-3 py-1 disabled:opacity-50 dark:bg-white dark:text-black"
            >
                {loading ? "Creating..." : "Create User"}
            </button>
        </form>
    );
}
