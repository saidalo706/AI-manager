"use client";
import { useDraggable } from "@dnd-kit/core";
import { CalendarDays, Clock, GripVertical, Sparkles, Trash2, Wand2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { DrawCheck } from "./DrawPath";
import { MagneticButton } from "./MagneticButton";

function deadlineInfo(iso: string | null): { label: string; cls: string } | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  if (diff < 0) return { label: `Просрочено · ${date}`, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-300" };
  if (diff === 0) return { label: "Сегодня", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-300" };
  if (diff === 1) return { label: "Завтра", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300" };
  return { label: date, cls: "bg-hover text-mute" };
}

const chip = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";

function Box({ checked, onClick, size = 18, label }: { checked: boolean; onClick: () => void; size?: number; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ width: size, height: size }}
      className={`mt-0.5 flex shrink-0 items-center justify-center rounded-md border ${
        checked
          ? "border-transparent bg-gradient-to-br from-violet-500 to-blue-500 text-white"
          : "border-mute/40 hover:border-violet-500"
      }`}
    >
      {checked && <DrawCheck size={size - 6} />}
    </button>
  );
}

interface Props {
  task: Task;
  decomposing: boolean;
  overlay?: boolean;
  /** задержка появления, мс (оркестровка) */
  delay?: number;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
  onDecompose: () => void;
  onToggleSubtask: (subId: string, done: boolean) => void;
}

export function TaskCard({ task, decomposing, overlay, delay = 0, onToggle, onDelete, onDecompose, onToggleSubtask }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, disabled: overlay });
  const dl = deadlineInfo(task.deadline);
  const total = task.subtasks.reduce((a, s) => a + s.minutes, 0);
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      ref={setNodeRef}
      style={{ animationDelay: `${delay}ms` }}
      className={`group animate-pop rounded-xl border border-line bg-paper/90 p-3.5 shadow-soft backdrop-blur-sm hover:shadow-lift ${
        isDragging ? "opacity-30" : ""
      } ${overlay ? "rotate-1 shadow-lift" : ""} ${task.done ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          aria-label="Перетащить"
          className="-ml-1.5 mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-mute/40 hover:bg-hover hover:text-mute active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <Box checked={task.done} onClick={() => onToggle(!task.done)} label={task.done ? "Снять отметку" : "Выполнено"} />
        <p className={`min-w-0 flex-1 break-words text-[15px] font-medium leading-snug ${task.done ? "text-mute line-through" : ""}`}>
          {task.title}
        </p>
        <button
          onClick={onDelete}
          aria-label="Удалить"
          className="-mr-1 rounded-md p-1 text-mute/50 hover:bg-rose-500/10 hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-[46px]">
        {task.reason && (
          <span className={`${chip} bg-violet-500/10 text-violet-600 dark:text-violet-300`} title="Обоснование приоритета от ИИ">
            <Sparkles size={11} /> {task.reason}
          </span>
        )}
        {dl && (
          <span className={`${chip} ${dl.cls}`}>
            <CalendarDays size={11} /> {dl.label}
          </span>
        )}
        {task.category && <span className={`${chip} bg-hover text-mute`}>{task.category}</span>}
        {task.block && <span className={`${chip} bg-hover text-mute`}>{task.block}</span>}
      </div>

      <div className="mt-3 pl-[46px]">
        {decomposing ? (
          <div className="space-y-2" aria-label="Генерация шагов">
            {[70, 90, 55].map((w) => (
              <div key={w} className="h-3.5 animate-pulse rounded-md bg-line" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : task.subtasks.length ? (
          <div className="rounded-lg bg-hover/70 p-2.5">
            <ul className="space-y-1.5">
              {task.subtasks.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-[13px]">
                  <Box checked={s.done} size={16} onClick={() => onToggleSubtask(s.id, !s.done)} label="Отметить шаг" />
                  <span className={`flex-1 leading-snug ${s.done ? "text-mute line-through" : ""}`}>{s.title}</span>
                  <span className="shrink-0 rounded-full bg-paper px-1.5 py-0.5 text-[11px] tabular-nums text-mute">
                    {s.minutes} мин
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between text-xs text-mute">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {subDone}/{task.subtasks.length} · ~{total} мин
              </span>
              <button onClick={onDecompose} className="rounded-md px-1.5 py-0.5 hover:bg-paper hover:text-ink">
                Пересоздать
              </button>
            </div>
          </div>
        ) : (
          <MagneticButton
            onClick={onDecompose}
            mode="attract"
            strength={0.3}
            radius={70}
            max={8}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-mute hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <Wand2 size={13} /> Разбить на шаги
          </MagneticButton>
        )}
      </div>
    </div>
  );
}
