import { NextResponse } from "next/server";
import { z } from "zod";
import { parseTasks } from "@/lib/gemini";
import { insertTasks } from "@/lib/repo";
import { fail } from "@/lib/http";

// Gemini может отвечать до минуты — увеличиваем лимит функции на Vercel
export const maxDuration = 60;

const Body =z.object({ text: z.string().trim().min(1).max(2000) });

export async function POST(req: Request) {
  try {
    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success)
      return NextResponse.json({ error: "Введите текст (до 2000 символов)" }, { status: 400 });
    const parsed = await parseTasks(body.data.text);
    if (!parsed.length)
      return NextResponse.json({ error: "ИИ не нашёл задач в тексте" }, { status: 422 });
    const tasks = await insertTasks(parsed);
    return NextResponse.json({ tasks });
  } catch (e) {
    return fail(e);
  }
}
