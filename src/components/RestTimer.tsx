import { useEffect, useRef, useState } from "react";
import { TimerIcon, XIcon } from "@phosphor-icons/react";
import { useNow } from "../hooks/useNow";
import { cn, formatClock } from "../lib/format";

const PRESETS = [60, 90, 120, 180];

interface RestTimerProps {
  /** when the rest started; changes every time a new set is saved */
  startedAt: number;
  onDismiss: () => void;
}

/** Countdown that starts after each saved set and buzzes when it ends. */
export function RestTimer({ startedAt, onDismiss }: RestTimerProps) {
  const [duration, setDuration] = useState(90);
  const now = useNow(250);
  const remaining = duration - (now - startedAt) / 1000;
  const done = remaining <= 0;
  const buzzedFor = useRef<number | null>(null);

  useEffect(() => {
    if (done && buzzedFor.current !== startedAt) {
      buzzedFor.current = startedAt;
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [done, startedAt]);

  return (
    <div
      role="timer"
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3",
        done ? "border-accent bg-accent/15" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          done ? "bg-accent text-accent-foreground" : "bg-muted",
        )}
      >
        <TimerIcon size={22} weight="fill" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {done ? "Descanso concluído" : "Descansando"}
        </p>
        <p className="font-mono text-2xl font-bold leading-none">
          {done ? "Bora!" : formatClock(Math.ceil(remaining))}
        </p>
      </div>

      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setDuration(p)}
            aria-pressed={p === duration}
            className={cn(
              "rounded-lg px-2 py-1 font-mono text-xs font-semibold transition-colors",
              p === duration
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {p}s
          </button>
        ))}
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dispensar timer"
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <XIcon size={16} weight="bold" />
      </button>
    </div>
  );
}
