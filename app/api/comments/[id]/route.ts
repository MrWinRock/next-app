import { NextResponse } from "next/server";
import { getComment, updateComment, deleteComment } from "@/lib/data";
import { UpdateCommentZ } from "@/lib/schemas";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const comment = await getComment(params.id);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(comment);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const json = await req.json();
        const patch = UpdateCommentZ.parse(json);
        const updated = await updateComment(params.id, patch);
        return NextResponse.json(updated);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const ok = await deleteComment(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
