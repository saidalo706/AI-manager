"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type MagneticMode = "attract" | "repel";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** attract — кнопка тянется к курсору, repel — отталкивается */
  mode?: MagneticMode;
  /** Доля смещения от расстояния до курсора (0–1) */
  strength?: number;
  /** Радиус зоны влияния вокруг кнопки, px */
  radius?: number;
  /** Максимальное смещение, px */
  max?: number;
}

/**
 * Магнитная кнопка. Смещение задаётся CSS-свойством `translate`,
 * поэтому не конфликтует с классами `scale-*` / `active:scale-*`.
 */
export const MagneticButton = forwardRef<HTMLButtonElement, Props>(function MagneticButton(
  { mode = "attract", strength = 0.35, radius = 90, max = 14, className = "", style, children, ...rest },
  fwd
) {
  const ref = useRef<HTMLButtonElement>(null);
  useImperativeHandle(fwd, () => ref.current as HTMLButtonElement);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reset = () => {
      el.style.translate = "0px 0px";
    };

    const apply = (e: PointerEvent) => {
      if (el.disabled) return reset();
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // расстояние от курсора до ближайшего края кнопки
      const ox = Math.max(Math.abs(dx) - r.width / 2, 0);
      const oy = Math.max(Math.abs(dy) - r.height / 2, 0);
      if (Math.hypot(ox, oy) > radius) return reset();
      const sign = mode === "attract" ? 1 : -1;
      const clamp = (v: number) => Math.max(-max, Math.min(max, v));
      el.style.translate = `${clamp(dx * strength * sign)}px ${clamp(dy * strength * sign)}px`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      apply(e);
    };
    const onLeaveWindow = () => reset();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [mode, strength, radius, max]);

  return (
    <button
      ref={ref}
      {...rest}
      className={`mag relative ${className}`}
      style={{
        ...style,
        translate: "0px 0px",
        transition: "translate .35s cubic-bezier(.22,1.4,.36,1), box-shadow .15s, filter .15s, background-color .15s",
        willChange: "translate",
      }}
    >
      {children}
    </button>
  );
});
