/**
 * «Draw a path» — SVG-контур, который прорисовывается линией.
 * Используется pathLength="1" + stroke-dashoffset (см. .draw в globals.css).
 */
export function DrawPath({
  d,
  className = "",
  duration = 1.2,
  delay = 0,
  strokeWidth = 2,
  style,
}: {
  d: string;
  className?: string;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`draw ${className}`}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s`, ...style }}
    />
  );
}

/** Галочка, которая рисуется при появлении */
export function DrawCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <DrawPath d="M4.5 12.5l5 5L19.5 7" duration={0.35} strokeWidth={3.5} />
    </svg>
  );
}

/** Фоновые линии, прорисовывающиеся при загрузке */
export function BackgroundPaths() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="bp1" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--b1))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--b2))" }} />
        </linearGradient>
        <linearGradient id="bp2" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--b3))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--b1))" }} />
        </linearGradient>
        <linearGradient id="bp3" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--b2))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--b3))" }} />
        </linearGradient>
      </defs>
      <g className="bg-paths">
        <DrawPath d="M-20 220 C 240 80, 420 380, 720 260 S 1200 60, 1460 240" className="bp" style={{ stroke: "url(#bp1)" }} duration={3.2} strokeWidth={2} />
        <DrawPath d="M-20 560 C 200 700, 460 420, 760 560 S 1180 760, 1460 520" className="bp" style={{ stroke: "url(#bp2)" }} duration={3.8} delay={0.3} strokeWidth={2} />
        <DrawPath d="M-20 820 C 300 680, 520 900, 860 790 S 1240 640, 1460 780" className="bp" style={{ stroke: "url(#bp3)" }} duration={4.2} delay={0.6} strokeWidth={2} />
        <DrawPath d="M300 -20 C 380 200, 200 420, 340 920" className="bp" style={{ stroke: "url(#bp1)" }} duration={4} delay={0.9} strokeWidth={1.5} />
        <DrawPath d="M1120 -20 C 1040 260, 1260 480, 1100 920" className="bp" style={{ stroke: "url(#bp2)" }} duration={4.4} delay={1.2} strokeWidth={1.5} />
      </g>
    </svg>
  );
}
