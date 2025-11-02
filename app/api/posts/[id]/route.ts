import { NextResponse } from "next/server";
import { getPost, updatePost, deletePost } from "@/lib/data";
import { UpdatePostZ } from "@/lib/schemas";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const json = await req.json();
        const patch = UpdatePostZ.parse(json);
        const updated = await updatePost(params.id, patch);
        return NextResponse.json(updated);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const ok = await deletePost(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
