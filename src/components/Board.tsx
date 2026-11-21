"use client";
import { useEffect, useState } from "react";
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { QUADRANTS, QUADRANT_META, type Quadrant, type Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface Handlers {
  busy: Set<string>;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onDecompose: (id: string) => void;
  onToggleSubtask: (taskId: string, subId: string, done: boolean) => void;
  onMove: (id: string, q: Quadrant) => void;
}

function QuadrantBox({ q, index, intro, tasks, h }: { q: Quadrant; index: number; intro: boolean; tasks: Task[]; h: Handlers }) {
  const { setNodeRef, isOver } = useDroppable({ id: q });
  const m = QUADRANT_META[q];
  // Оркестровка (только при первой загрузке): квадранты появляются по очереди, карточки — следом
  const base = intro ? 260 + index * 110 : 0;
  return (
    <section
      ref={setNodeRef}
      style={{ animationDelay: `${base}ms` }}
      className={`flex min-h-[220px] animate-pop flex-col rounded-2xl border bg-gradient-to-b p-3 backdrop-blur-md transition-[border-color,box-shadow] ${m.tint} ${
        isOver ? "border-ink/30 shadow-lift ring-4 ring-ink/5" : "border-line/80"
      }`}
    >
      <header className="mb-3 flex items-center gap-2 px-1.5 pt-1">
        <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
        <h2 className="text-sm font-semibold tracking-tight">{m.title}</h2>
        <span className="hidden text-xs text-mute sm:inline">{m.emoji} {m.hint}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${m.chip}`}>{tasks.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line p-5 text-center text-sm text-mute">
            {isOver ? "Отпустите здесь" : "Пусто — перетащите задачу сюда"}
          </div>
        ) : (
          tasks.map((t, i) => (
            <TaskCard
              key={t.id}
              task={t}
              delay={intro ? base + 140 + i * 70 : 0}
              decomposing={h.busy.has(t.id)}
              onToggle={(d) => h.onToggle(t.id, d)}
              onDelete={() => h.onDelete(t.id)}
              onDecompose={() => h.onDecompose(t.id)}
              onToggleSubtask={(sid, d) => h.onToggleSubtask(t.id, sid, d)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function Board({ tasks, ...h }: { tasks: Task[] } & Handlers) {
  const [active, setActive] = useState<Task | null>(null);
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1800);
    return () => clearTimeout(t);
  }, []);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    if (e.over) h.onMove(String(e.active.id), e.over.id as Quadrant);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActive(tasks.find((t) => t.id === e.active.id) ?? null)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {QUADRANTS.map((q, i) => (
          <QuadrantBox key={q} q={q} index={i} intro={intro} tasks={tasks.filter((t) => t.quadrant === q)} h={h} />
        ))}
      </div>
      <DragOverlay>
        {active && (
          <TaskCard
            task={active}
            overlay
            decomposing={false}
            onToggle={() => {}}
            onDelete={() => {}}
            onDecompose={() => {}}
            onToggleSubtask={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
