"use client";
import { AlertCircle, Sparkles, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { SmartInput } from "./SmartInput";
import { Board } from "./Board";
import { DrawPath } from "./DrawPath";

export function App() {
  const t = useTasks();
  const done = t.tasks.filter((x) => x.done).length;
  const total = t.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 animate-pop border-b border-line/70 bg-canvas/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-soft">
            <Sparkles size={18} />
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold tracking-tight">AI Task Manager</h1>
            <p className="hidden text-xs text-mute sm:block">Матрица Эйзенхауэра</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold tabular-nums">
                {done}<span className="text-mute font-normal"> / {total}</span>
              </div>
              <div className="text-[11px] text-mute">выполнено</div>
            </div>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-line sm:w-36">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm font-semibold tabular-nums">{pct}%</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
        <SmartInput parsing={t.parsing} onSubmit={t.parse} />

        {t.error && (
          <div
            role="alert"
            className="flex animate-pop items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{t.error}</span>
            <button onClick={t.clearError} aria-label="Закрыть" className="rounded p-0.5 hover:bg-rose-500/10">
              <X size={16} />
            </button>
          </div>
        )}

        {t.loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-line/60" />
            ))}
          </div>
        ) : (
          <>
            {total === 0 && (
              <div className="animate-pop rounded-2xl border border-dashed border-line bg-paper/60 px-6 py-10 text-center shadow-soft">
                <svg
                  className="mx-auto h-24 w-48 text-violet-500"
                  viewBox="0 0 200 100"
                  stroke="currentColor"
                  aria-hidden
                >
                  <DrawPath d="M20 88 C 40 20, 110 110, 130 40 S 160 14, 172 14" duration={1.6} strokeWidth={3} />
                  <DrawPath d="M158 6 L174 14 L160 26" duration={0.5} delay={1.5} strokeWidth={3} />
                  <DrawPath d="M20 88 l0 0" duration={0.1} strokeWidth={8} />
                </svg>
                <h2 className="mt-3 font-semibold tracking-tight">Пока нет задач</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-mute">
                  Напишите или надиктуйте список дел в поле выше — ИИ разложит их по матрице Эйзенхауэра.
                </p>
              </div>
            )}
            <Board
              tasks={t.tasks}
              busy={t.busy}
              onToggle={t.toggle}
              onDelete={t.remove}
              onDecompose={t.decompose}
              onToggleSubtask={t.toggleSubtask}
              onMove={t.move}
            />
          </>
        )}
      </main>
    </div>
  );
}
