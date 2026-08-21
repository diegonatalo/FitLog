import { ClockCounterClockwise, Trash } from "@phosphor-icons/react";
import type { WorkoutSet } from "../types";
import { formatTime, relativeDay } from "../lib/format";

interface HistoryListProps {
  sets: WorkoutSet[];
  onRemoveSet: (id: string) => void;
}

export function HistoryList({ sets, onRemoveSet }: HistoryListProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <ClockCounterClockwise size={18} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Histórico
        </h2>
      </div>

      {sets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground text-sm">
          Nenhuma série registrada ainda.
          <br />
          Salve a primeira acima.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {sets.map((s) => (
            <li
              key={s.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
            >
              <div className="flex flex-col items-center justify-center min-w-16 shrink-0">
                <span className="font-mono text-xl font-bold leading-none">
                  {s.load}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                  {s.loadType === "weight" ? "kg" : "placas"}
                </span>
              </div>

              <div className="w-px self-stretch bg-border" />

              <div className="flex-1 min-w-0">
                <p className="font-semibold">
                  {s.reps}{" "}
                  <span className="font-normal text-muted-foreground">
                    repetições
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {relativeDay(s.createdAt)} · {formatTime(s.createdAt)}
                </p>
              </div>

              <button
                onClick={() => onRemoveSet(s.id)}
                aria-label="Excluir registro"
                className="size-9 shrink-0 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash size={17} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
