import { useState } from "react";
import {
  ClockCounterClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import type { WorkoutSet } from "../types";
import { loadTypeMeta } from "../types";
import { formatTime, loadParts, relativeDay } from "../lib/format";
import { recordIds } from "../lib/stats";
import { EditSetDialog } from "./EditSetDialog";

interface HistoryListProps {
  sets: WorkoutSet[];
  onRemoveSet: (id: string) => void;
  onUpdateSet: (
    id: string,
    patch: { load: number; reps: number; note: string },
  ) => void;
}

export function HistoryList({
  sets,
  onRemoveSet,
  onUpdateSet,
}: HistoryListProps) {
  const [editing, setEditing] = useState<WorkoutSet | null>(null);
  const records = recordIds(sets);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <ClockCounterClockwiseIcon
          size={18}
          className="text-muted-foreground"
        />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Histórico
        </h2>
      </div>

      {sets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Nenhuma série registrada ainda.
          <br />
          Salve a primeira acima.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {sets.map((s) => {
            const { value, unit } = loadParts(s.loadType, s.load);
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <div className="flex min-w-16 shrink-0 flex-col items-center justify-center">
                  <span className="font-mono text-xl font-bold leading-none">
                    {value}
                  </span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {unit}
                  </span>
                </div>

                <div className="w-px self-stretch bg-border" />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {loadTypeMeta(s.loadType).hasReps ? (
                      <span>
                        {s.reps}{" "}
                        <span className="font-normal text-muted-foreground">
                          repetições
                        </span>
                      </span>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        Tempo total
                      </span>
                    )}
                    {records.has(s.id) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                        <TrophyIcon size={11} weight="fill" /> PR
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {relativeDay(s.createdAt)} · {formatTime(s.createdAt)}
                  </p>
                  {s.note && (
                    <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
                      {s.note}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setEditing(s)}
                  aria-label="Editar registro"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PencilSimpleIcon size={17} />
                </button>
                <button
                  onClick={() => onRemoveSet(s.id)}
                  aria-label="Excluir registro"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashIcon size={17} />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {editing && (
        <EditSetDialog
          set={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdateSet(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
