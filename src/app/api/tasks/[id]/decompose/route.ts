import { NextResponse } from "next/server";
import { getTask, replaceSubtasks } from "@/lib/repo";
import { decomposeTask } from "@/lib/gemini";
import { fail } from "@/lib/http";

// Gemini может отвечать до минуты — увеличиваем лимит функции на Vercel
export const maxDuration = 60;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    const steps = await decomposeTask(task.title, task.category);
    await replaceSubtasks(id, steps);
    const updated = await getTask(id);
    return NextResponse.json({ subtasks: updated?.subtasks ?? [] });
  } catch (e) {
    return fail(e);
  }
}
