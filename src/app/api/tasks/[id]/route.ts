import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteTask, updateTask } from "@/lib/repo";
import { QUADRANTS } from "@/lib/types";
import { fail } from "@/lib/http";

const Patch = z.object({ done: z.boolean().optional(), quadrant: z.enum(QUADRANTS).optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = Patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const ok = await updateTask(id, body.data);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Не найдено" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
