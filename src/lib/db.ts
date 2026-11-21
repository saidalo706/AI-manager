import "server-only";
import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    // На Vercel файловая система только для чтения: локальный файл не подходит
    if (!process.env.TURSO_DATABASE_URL && process.env.VERCEL)
      throw new Error("TURSO_DATABASE_URL не задан в переменных окружения Vercel");
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:local.db",
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

/** Возвращает клиент; схема создаётся при первом обращении. */
export async function db(): Promise<Client> {
  const c = getClient();
  if (!ready) {
    ready = c
      .batch(
        [
          `CREATE TABLE IF NOT EXISTS atm_tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            quadrant TEXT NOT NULL,
            category TEXT,
            block TEXT,
            deadline TEXT,
            reason TEXT,
            done INTEGER NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
          `CREATE TABLE IF NOT EXISTS atm_subtasks (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL REFERENCES atm_tasks(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            minutes INTEGER NOT NULL DEFAULT 10,
            done INTEGER NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0
          )`,
          `CREATE INDEX IF NOT EXISTS idx_atm_subtasks_task ON atm_subtasks(task_id)`,
        ],
        "write"
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  await ready;
  return c;
}
