import { NextResponse } from "next/server";
import { listPosts, createPost } from "@/lib/data";
import { CreatePostZ } from "@/lib/schemas";

export async function GET() {
    const posts = await listPosts();
    return NextResponse.json(posts);
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const input = CreatePostZ.parse(json);
        const created = await createPost(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
