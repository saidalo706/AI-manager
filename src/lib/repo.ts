import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { Quadrant, Subtask, Task } from "./types";

type NewTask = Omit<Task, "id" | "done" | "subtasks">;

export async function listTasks(): Promise<Task[]> {
  const c = await db();
  const [t, s] = await Promise.all([
    c.execute("SELECT * FROM atm_tasks ORDER BY position ASC, created_at ASC"),
    c.execute("SELECT * FROM atm_subtasks ORDER BY position ASC"),
  ]);
  const subs = new Map<string, Subtask[]>();
  for (const r of s.rows) {
    const sub: Subtask = {
      id: String(r.id),
      taskId: String(r.task_id),
      title: String(r.title),
      minutes: Number(r.minutes),
      done: Number(r.done) === 1,
    };
    subs.set(sub.taskId, [...(subs.get(sub.taskId) ?? []), sub]);
  }
  return t.rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    quadrant: String(r.quadrant) as Quadrant,
    category: r.category ? String(r.category) : null,
    block: r.block ? String(r.block) : null,
    deadline: r.deadline ? String(r.deadline) : null,
    reason: r.reason ? String(r.reason) : null,
    done: Number(r.done) === 1,
    subtasks: subs.get(String(r.id)) ?? [],
  }));
}

export async function getTask(id: string): Promise<Task | null> {
  return (await listTasks()).find((t) => t.id === id) ?? null;
}

export async function insertTasks(items: NewTask[]): Promise<Task[]> {
  if (!items.length) return [];
  const c = await db();
  const max = await c.execute("SELECT COALESCE(MAX(position), 0) AS m FROM atm_tasks");
  let pos = Number(max.rows[0].m);
  const ids: string[] = [];
  await c.batch(
    items.map((t) => {
      const id = randomUUID();
      ids.push(id);
      pos += 1;
      return {
        sql: `INSERT INTO atm_tasks (id, title, quadrant, category, block, deadline, reason, position)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, t.title, t.quadrant, t.category, t.block, t.deadline, t.reason, pos],
      };
    }),
    "write"
  );
  return (await listTasks()).filter((t) => ids.includes(t.id));
}

export async function updateTask(
  id: string,
  patch: { done?: boolean; quadrant?: Quadrant }
): Promise<boolean> {
  const sets: string[] = [];
  const args: (string | number)[] = [];
  if (patch.done !== undefined) {
    sets.push("done = ?");
    args.push(patch.done ? 1 : 0);
  }
  if (patch.quadrant !== undefined) {
    sets.push("quadrant = ?");
    args.push(patch.quadrant);
  }
  if (!sets.length) return false;
  const c = await db();
  const r = await c.execute({
    sql: `UPDATE atm_tasks SET ${sets.join(", ")} WHERE id = ?`,
    args: [...args, id],
  });
  return r.rowsAffected > 0;
}

export async function deleteTask(id: string): Promise<boolean> {
  const c = await db();
  // Явное удаление подзадач — не зависим от PRAGMA foreign_keys.
  const res = await c.batch(
    [
      { sql: "DELETE FROM atm_subtasks WHERE task_id = ?", args: [id] },
      { sql: "DELETE FROM atm_tasks WHERE id = ?", args: [id] },
    ],
    "write"
  );
  return res[1].rowsAffected > 0;
}

/** Заменяет подзадачи задачи новыми. */
export async function replaceSubtasks(
  taskId: string,
  items: { title: string; minutes: number }[]
): Promise<void> {
  const c = await db();
  await c.batch(
    [
      { sql: "DELETE FROM atm_subtasks WHERE task_id = ?", args: [taskId] },
      ...items.map((s, i) => ({
        sql: "INSERT INTO atm_subtasks (id, task_id, title, minutes, position) VALUES (?, ?, ?, ?, ?)",
        args: [randomUUID(), taskId, s.title, s.minutes, i],
      })),
    ],
    "write"
  );
}

export async function setSubtaskDone(id: string, done: boolean): Promise<boolean> {
  const c = await db();
  const r = await c.execute({
    sql: "UPDATE atm_subtasks SET done = ? WHERE id = ?",
    args: [done ? 1 : 0, id],
  });
  return r.rowsAffected > 0;
}
