import { NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/data";
import { CreateUserZ } from "@/lib/schemas";

export async function GET() {
    const users = await listUsers();
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const input = CreateUserZ.parse(json);
        const created = await createUser(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
