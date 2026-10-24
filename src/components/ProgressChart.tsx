import { ChartLineUpIcon } from "@phosphor-icons/react";
import type { LoadType, WorkoutSet } from "../types";
import { dailyBest } from "../lib/stats";
import { formatDate, formatLoad, loadParts } from "../lib/format";

interface ProgressChartProps {
  sets: WorkoutSet[];
  loadType: LoadType;
}

const W = 320;
const H = 120;
const PAD = { top: 12, right: 12, bottom: 12, left: 12 };
const MAX_POINTS = 20;

/** Best load per day, as a small line chart. Needs at least two days. */
export function ProgressChart({ sets, loadType }: ProgressChartProps) {
  const points = dailyBest(sets, loadType).slice(-MAX_POINTS);
  if (points.length < 2) return null;

  const loads = points.map((p) => p.load);
  const min = Math.min(...loads);
  const max = Math.max(...loads);
  const span = max - min || 1;

  const x = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const y = (load: number) =>
    PAD.top + (1 - (load - min) / span) * (H - PAD.top - PAD.bottom);

  const line = points.map((p, i) => `${x(i)},${y(p.load)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.load - first.load;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <ChartLineUpIcon size={18} /> Evolução
        </h2>
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {delta > 0 ? "+" : ""}
          {+delta.toFixed(2)} {loadParts(loadType, 0).unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Melhor carga por dia: de ${formatLoad(loadType, first.load)} em ${formatDate(first.day)} para ${formatLoad(loadType, last.load)} em ${formatDate(last.day)}`}
        className="h-auto w-full overflow-visible"
      >
        <polyline
          points={`${x(0)},${H - PAD.bottom} ${line} ${x(points.length - 1)},${H - PAD.bottom}`}
          fill="var(--accent)"
          fillOpacity={0.12}
          stroke="none"
        />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.day}
            cx={x(i)}
            cy={y(p.load)}
            r={i === points.length - 1 ? 4.5 : 3}
            fill="var(--card)"
            stroke="var(--accent)"
            strokeWidth={2}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{formatDate(first.day)}</span>
        <span>
          {formatLoad(loadType, min)} – {formatLoad(loadType, max)}
        </span>
        <span>{formatDate(last.day)}</span>
      </div>
    </section>
  );
}
