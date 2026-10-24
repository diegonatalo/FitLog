import { useState } from "react";
import { ChartLineIcon } from "@phosphor-icons/react";
import type { CardioProfile } from "../types";
import { compare, estimate } from "../lib/cardio";
import type { CardioInput, Metric } from "../lib/cardio";
import { cn } from "../lib/format";

interface CardioChartProps {
  input: CardioInput;
  profile: CardioProfile;
}

const W = 320;
const H = 190;
const PAD = { top: 12, right: 12, bottom: 24, left: 38 };
const Y_TICKS = 4;

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "kcal", label: "Calorias", unit: "kcal" },
  { value: "hr", label: "Freq. cardíaca", unit: "bpm" },
];

/** Colors for the reference inclines; the user's own incline uses the accent. */
const OTHER_COLORS = [
  "oklch(0.65 0.12 250)",
  "oklch(0.7 0.14 205)",
  "oklch(0.72 0.15 70)",
  "oklch(0.66 0.17 25)",
  "oklch(0.64 0.15 310)",
];

export function CardioChart({ input, profile }: CardioChartProps) {
  const [metric, setMetric] = useState<Metric>("kcal");
  const meta = METRICS.find((m) => m.value === metric) ?? METRICS[0];

  const { curves, speeds } = compare(input, profile, metric);
  const mine = estimate(input, profile);
  const myValue = metric === "kcal" ? mine.kcal : mine.avgHr;

  const values = curves.flatMap((c) => c.points.map((p) => p.value));
  const rawMin = Math.min(...values, myValue);
  const rawMax = Math.max(...values, myValue);
  const step = niceStep((rawMax - rawMin) / Y_TICKS);
  const min = Math.floor(rawMin / step) * step;
  const max = Math.max(Math.ceil(rawMax / step) * step, min + step);
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-6; v += step) ticks.push(v);

  const lo = speeds[0];
  const hi = speeds[speeds.length - 1];
  const x = (s: number) =>
    PAD.left + ((s - lo) / (hi - lo)) * (W - PAD.left - PAD.right);
  const y = (v: number) =>
    PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);

  const xLabels = speeds.filter((s) => Number.isInteger(s) && s % 2 === 0);
  let otherIdx = 0;
  const styled = curves.map((c) => {
    const isMine = c.incline === input.inclinePct;
    return {
      ...c,
      isMine,
      color: isMine ? "var(--accent)" : OTHER_COLORS[otherIdx++ % OTHER_COLORS.length],
    };
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <ChartLineIcon size={18} /> Comparar
        </h2>
        <div
          role="group"
          aria-label="Métrica do gráfico"
          className="flex rounded-lg bg-muted p-0.5 text-xs font-semibold"
        >
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              aria-pressed={metric === m.value}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors",
                metric === m.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${meta.label} por velocidade em cada inclinação. Sua sessão: ${myValue} ${meta.unit} a ${input.speedKmh} km/h com ${input.inclinePct}% de inclinação.`}
        className="h-auto w-full overflow-visible"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground font-mono"
              fontSize={9}
            >
              {Math.round(t)}
            </text>
          </g>
        ))}
        {xLabels.map((s) => (
          <text
            key={s}
            x={x(s)}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground font-mono"
            fontSize={9}
          >
            {s}
          </text>
        ))}

        {/* the user's own incline is drawn last so it stays on top */}
        {[...styled.filter((c) => !c.isMine), ...styled.filter((c) => c.isMine)].map(
          (c) => (
            <polyline
              key={c.incline}
              points={c.points.map((p) => `${x(p.speed)},${y(p.value)}`).join(" ")}
              fill="none"
              stroke={c.color}
              strokeWidth={c.isMine ? 3 : 1.75}
              strokeOpacity={c.isMine ? 1 : 0.85}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ),
        )}

        <line
          x1={x(input.speedKmh)}
          x2={x(input.speedKmh)}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="var(--accent)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle
          cx={x(input.speedKmh)}
          cy={y(myValue)}
          r={5}
          fill="var(--card)"
          stroke="var(--accent)"
          strokeWidth={2.5}
        />
      </svg>

      <p className="mt-1 text-center font-mono text-[11px] text-muted-foreground">
        velocidade (km/h) ·{" "}
        {metric === "kcal"
          ? `kcal em ${input.minutes} min`
          : "bpm médio estimado"}
      </p>
      <p className="mt-1 text-center text-[11px] text-muted-foreground text-pretty">
        A partir de 8 km/h o cálculo passa de caminhada para corrida, por isso
        a curva muda de ritmo ali.
      </p>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-medium">
        {styled.map((c) => (
          <li key={c.incline} className="flex items-center gap-1.5">
            <span
              className="h-1 w-4 rounded-full"
              style={{ backgroundColor: c.color }}
            />
            <span className={cn(c.isMine && "font-bold")}>
              {c.incline}%{c.isMine && " (você)"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Rounds a raw step up to 1, 2, 5 × 10ⁿ so axis labels stay readable. */
function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}
