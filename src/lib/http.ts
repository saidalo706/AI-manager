import "server-only";
import { NextResponse } from "next/server";
import { AiError } from "./gemini";

export function fail(e: unknown) {
  if (e instanceof AiError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(e instanceof Error ? e.message : e);
  return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
}
