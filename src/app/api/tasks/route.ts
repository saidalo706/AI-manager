import { NextResponse } from "next/server";
import { listTasks } from "@/lib/repo";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ tasks: await listTasks() });
  } catch (e) {
    return fail(e);
  }
}
