export const QUADRANTS = ["do", "plan", "delegate", "eliminate"] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export const QUADRANT_META: Record<
  Quadrant,
  { title: string; hint: string; emoji: string; tint: string; dot: string; chip: string }
> = {
  do: {
    title: "Срочно и важно", hint: "Сделать сейчас", emoji: "🔥",
    tint: "from-rose-500/[0.09] to-rose-500/[0.02]", dot: "bg-rose-500", chip: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  plan: {
    title: "Важно, не срочно", hint: "Запланировать", emoji: "🎯",
    tint: "from-blue-500/[0.09] to-blue-500/[0.02]", dot: "bg-blue-500", chip: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  delegate: {
    title: "Срочно, не важно", hint: "Делегировать", emoji: "⚡",
    tint: "from-amber-500/[0.10] to-amber-500/[0.02]", dot: "bg-amber-500", chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  eliminate: {
    title: "Не срочно, не важно", hint: "Отложить", emoji: "🌿",
    tint: "from-emerald-500/[0.08] to-emerald-500/[0.02]", dot: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  minutes: number;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  quadrant: Quadrant;
  category: string | null;
  block: string | null;
  deadline: string | null; // YYYY-MM-DD
  reason: string | null;
  done: boolean;
  subtasks: Subtask[];
}
