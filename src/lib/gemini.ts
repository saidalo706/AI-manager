import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { QUADRANTS } from "./types";

export class AiError extends Error {
  constructor(
    message: string,
    public status = 502
  ) {
    super(message);
  }
}

function client() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("GEMINI_API_KEY не задан на сервере (.env.local)", 500);
  return new GoogleGenAI({ apiKey: key });
}

async function generateJson<T>(
  prompt: string,
  responseSchema: object,
  parser: z.ZodType<T>
): Promise<T> {
  const ai = client();
  const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
    try {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema, temperature: 0.3 },
      });
      return parser.parse(JSON.parse(res.text ?? ""));
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : "";
      if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg))
        throw new AiError("Превышен лимит запросов к ИИ, попробуйте позже", 429);
      if (/API key|401|403|PERMISSION/i.test(msg))
        throw new AiError("Неверный GEMINI_API_KEY или нет доступа к модели", 500);
      if (/404|NOT_FOUND/i.test(msg))
        throw new AiError(`Модель «${model}» не найдена — проверьте GEMINI_MODEL`, 500);
    }
  }
  const last = lastErr instanceof Error ? lastErr.message : String(lastErr);
  console.error("Gemini error:", last);
  if (/503|UNAVAILABLE|overloaded|high demand/i.test(last))
    throw new AiError("Модель Gemini сейчас перегружена, попробуйте через минуту", 503);
  throw new AiError("ИИ не смог обработать запрос, попробуйте ещё раз");
}

const clampWords = (s: string, n: number) => s.trim().split(/\s+/).slice(0, n).join(" ");

const ParsedSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1).max(200),
      deadline: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      block: z.string().nullable().optional(),
      quadrant: z.enum(QUADRANTS),
      reason: z.string().default(""),
    })
  ),
});

export async function parseTasks(text: string) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const prompt = `Ты — ассистент-планировщик. Из сырого текста пользователя (на русском, возможно надиктованного голосом) извлеки отдельные задачи.
Сегодня ${today} (${weekday}). Относительные даты («завтра», «в пятницу») переводи в YYYY-MM-DD. Если срока нет — null.
Для каждой задачи:
- title: короткая формулировка действия (до 80 символов);
- deadline: YYYY-MM-DD или null;
- category: одна тема одним словом (Работа, Дом, Учёба, Здоровье, Финансы, Семья, Покупки и т.п.);
- block: часть дня или контекст выполнения: «Утро», «День», «Вечер» или «Любое время»;
- quadrant: матрица Эйзенхауэра — "do" (срочно и важно), "plan" (важно, не срочно), "delegate" (срочно, не важно), "eliminate" (не срочно и не важно);
- reason: краткая причина приоритета, СТРОГО не более 7 слов.
Не выдумывай задачи, которых нет в тексте.

Текст:
"""${text}"""`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            deadline: { type: Type.STRING, nullable: true },
            category: { type: Type.STRING },
            block: { type: Type.STRING },
            quadrant: { type: Type.STRING, enum: [...QUADRANTS] },
            reason: { type: Type.STRING },
          },
          required: ["title", "category", "block", "quadrant", "reason"],
        },
      },
    },
    required: ["tasks"],
  };

  const out = await generateJson(prompt, schema, ParsedSchema);
  return out.tasks.map((t) => ({
    title: t.title.trim(),
    quadrant: t.quadrant,
    category: t.category?.trim() || null,
    block: t.block?.trim() || null,
    deadline: t.deadline && /^\d{4}-\d{2}-\d{2}$/.test(t.deadline) ? t.deadline : null,
    reason: t.reason ? clampWords(t.reason, 7) : null,
  }));
}

const StepsSchema = z.object({
  steps: z.array(z.object({ title: z.string().min(1).max(200), minutes: z.number() })).min(1),
});

export async function decomposeTask(title: string, category: string | null) {
  const prompt = `Разбей задачу на 3–5 конкретных, выполнимых шагов по порядку. Для каждого шага оцени время в минутах (целое число от 1 до 240). Пиши по-русски, коротко, с глагола.
Задача: «${title}»${category ? `\nКатегория: ${category}` : ""}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      steps: {
        type: Type.ARRAY,
        minItems: "3",
        maxItems: "5",
        items: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, minutes: { type: Type.INTEGER } },
          required: ["title", "minutes"],
        },
      },
    },
    required: ["steps"],
  };
  const out = await generateJson(prompt, schema, StepsSchema);
  return out.steps.slice(0, 5).map((s) => ({
    title: s.title.trim(),
    minutes: Math.min(240, Math.max(1, Math.round(s.minutes))),
  }));
}
