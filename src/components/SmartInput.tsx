"use client";
import { useState } from "react";
import { Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import { MagneticButton } from "./MagneticButton";

interface Props {
  parsing: boolean;
  onSubmit: (text: string) => Promise<boolean>;
}

export function SmartInput({ parsing, onSubmit }: Props) {
  const [text, setText] = useState("");
  const speech = useSpeech((t) => setText((prev) => (prev ? prev.trimEnd() + " " : "") + t));

  const submit = async () => {
    if (!text.trim() || parsing) return;
    if (speech.listening) speech.stop();
    if (await onSubmit(text.trim())) setText("");
  };

  return (
    <div
      className="animate-pop rounded-2xl bg-gradient-to-br from-violet-500/40 via-blue-500/30 to-emerald-400/40 p-px shadow-soft"
      style={{ animationDelay: "120ms" }}
    >
      <div className="rounded-[15px] bg-paper">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          maxLength={2000}
          placeholder="Что нужно сделать? Например: «завтра сдать отчёт, купить молоко, на неделе записаться к врачу»…"
          className="block w-full resize-none rounded-t-[15px] bg-transparent px-5 pt-4 text-[15px] leading-relaxed outline-none placeholder:text-mute/70"
        />
        <div className="flex flex-wrap items-center gap-2.5 px-3 pb-3 pt-1">
          <MagneticButton
            type="button"
            mode="attract"
            strength={0.4}
            onClick={speech.listening ? speech.stop : speech.start}
            disabled={!speech.supported}
            title={speech.supported ? "Голосовой ввод (ru-RU)" : "Браузер не поддерживает голосовой ввод"}
            aria-label="Голосовой ввод"
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              speech.listening
                ? "animate-pulse border-rose-500/40 bg-rose-500/15 text-rose-500"
                : "border-line text-mute hover:bg-hover hover:text-ink"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {speech.supported ? <Mic size={18} /> : <MicOff size={18} />}
          </MagneticButton>
          <span className="min-w-0 flex-1 truncate text-xs text-mute">
            {speech.error ?? (speech.listening ? "Слушаю… говорите" : "Ctrl + Enter — отправить")}
          </span>
          <MagneticButton
            type="button"
            mode="attract"
            strength={0.3}
            radius={110}
            onClick={submit}
            disabled={!text.trim() || parsing}
            className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 text-sm font-medium text-white shadow-soft hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
          >
            {parsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {parsing ? "Разбираю…" : "Разобрать с ИИ"}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
