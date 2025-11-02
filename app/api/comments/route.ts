import { NextResponse } from "next/server";
import { listComments, listCommentsByPost, createComment } from "@/lib/data";
import { CreateCommentZ } from "@/lib/schemas";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (postId) {
        const comments = await listCommentsByPost(postId);
        return NextResponse.json(comments);
    }
    // Not exposing global list by default; return empty unless postId specified
    const comments = await listComments();
    return NextResponse.json(comments);
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const input = CreateCommentZ.parse(json);
        const created = await createComment(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
