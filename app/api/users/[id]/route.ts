import { NextResponse } from "next/server";
import { getUser, updateUser, deleteUser } from "@/lib/data";
import { UpdateUserZ } from "@/lib/schemas";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const user = await getUser(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const json = await req.json();
        const patch = UpdateUserZ.parse(json);
        const updated = await updateUser(params.id, patch);
        return NextResponse.json(updated);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const ok = await deleteUser(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
