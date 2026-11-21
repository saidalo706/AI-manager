"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* Минимальные типы Web Speech API (нет в lib.dom) */
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecCtor = new () => SpeechRec;

export function useSpeech(onFinalText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const cbRef = useRef(onFinalText);
  cbRef.current = onFinalText;

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Голосовой ввод не поддерживается этим браузером");
      return;
    }
    setError(null);
    const rec = new Ctor();
    rec.lang = "ru-RU";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript;
      }
      if (text.trim()) cbRef.current(text.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed")
        setError("Нет доступа к микрофону — разрешите его в браузере");
      else if (e.error !== "no-speech" && e.error !== "aborted") setError("Ошибка распознавания речи");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  useEffect(() => () => recRef.current?.stop(), []);

  return { supported, listening, error, start, stop };
}
