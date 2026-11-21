"use client";
import { useCallback, useEffect, useState } from "react";
import type { Quadrant, Subtask, Task } from "@/lib/types";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Ошибка запроса");
  return data as T;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const d = await api<{ tasks: Task[] }>("/api/tasks");
      setTasks(d.tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const patchLocal = (id: string, fn: (t: Task) => Task) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

  /** Оптимистичное действие с откручиванием при ошибке. */
  const optimistic = async (apply: () => void, request: () => Promise<unknown>) => {
    const snapshot = tasks;
    apply();
    try {
      await request();
    } catch (e) {
      setTasks(snapshot);
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const parse = async (text: string): Promise<boolean> => {
    setParsing(true);
    setError(null);
    try {
      const d = await api<{ tasks: Task[] }>("/api/parse", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setTasks((ts) => [...ts, ...d.tasks]);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка разбора");
      return false;
    } finally {
      setParsing(false);
    }
  };

  const toggle = (id: string, done: boolean) =>
    optimistic(
      () => patchLocal(id, (t) => ({ ...t, done })),
      () => api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ done }) })
    );

  const move = (id: string, quadrant: Quadrant) => {
    if (tasks.find((t) => t.id === id)?.quadrant === quadrant) return;
    return optimistic(
      () => patchLocal(id, (t) => ({ ...t, quadrant })),
      () => api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ quadrant }) })
    );
  };

  const remove = (id: string) =>
    optimistic(
      () => setTasks((ts) => ts.filter((t) => t.id !== id)),
      () => api(`/api/tasks/${id}`, { method: "DELETE" })
    );

  const toggleSubtask = (taskId: string, subId: string, done: boolean) =>
    optimistic(
      () =>
        patchLocal(taskId, (t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done } : s)),
        })),
      () => api(`/api/subtasks/${subId}`, { method: "PATCH", body: JSON.stringify({ done }) })
    );

  const decompose = async (id: string) => {
    setBusy((b) => new Set(b).add(id));
    setError(null);
    try {
      const d = await api<{ subtasks: Subtask[] }>(`/api/tasks/${id}/decompose`, { method: "POST" });
      patchLocal(id, (t) => ({ ...t, subtasks: d.subtasks }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка декомпозиции");
    } finally {
      setBusy((b) => {
        const n = new Set(b);
        n.delete(id);
        return n;
      });
    }
  };

  return { tasks, loading, parsing, busy, error, clearError: () => setError(null), parse, toggle, move, remove, toggleSubtask, decompose };
}
