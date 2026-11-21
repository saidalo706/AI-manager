import { NextResponse } from "next/server";
import { z } from "zod";
import { setSubtaskDone } from "@/lib/repo";
import { fail } from "@/lib/http";

const Patch = z.object({ done: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = Patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const ok = await setSubtaskDone(id, body.data.done);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Не найдено" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}
