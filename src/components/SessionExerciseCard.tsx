import { useState } from "react";
import {
  BarbellIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import type { Exercise, LoadType, WorkoutSet } from "../types";
import { formatLoad, formatSet } from "../lib/format";
import { recordIds } from "../lib/stats";
import { EditSetDialog } from "./EditSetDialog";
import { LogForm } from "./LogForm";
import { MuscleBadge } from "./MuscleBadge";

interface SessionExerciseCardProps {
  exercise: Exercise;
  /** sets logged in the current session, oldest first */
  sets: WorkoutSet[];
  /** previous set of this exercise, from any session, newest first */
  history: WorkoutSet[];
  onAddSet: (loadType: LoadType, load: number, reps: number) => boolean;
  onUpdateSet: (
    id: string,
    patch: { load: number; reps: number; note: string },
  ) => void;
  onRemoveSet: (id: string) => void;
}

export function SessionExerciseCard({
  exercise,
  sets,
  history,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: SessionExerciseCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutSet | null>(null);
  const records = recordIds(history);
  // the latest set of this session, or else the last one ever logged
  const last = sets[sets.length - 1] ?? history[0];

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
          <BarbellIcon size={18} weight="fill" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{exercise.name}</span>
          <span className="block text-xs text-muted-foreground">
            {sets.length} {sets.length === 1 ? "série" : "séries"}
            {last && sets.length === 0 && (
              <> · última vez {formatLoad(last.loadType, last.load)}</>
            )}
          </span>
        </span>
        <MuscleBadge group={exercise.muscleGroup} />
      </div>

      {sets.length > 0 && (
        <ol className="flex flex-col gap-1.5 px-4 pb-3">
          {sets.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-md bg-background font-mono text-xs font-bold">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-mono font-semibold">
                  {formatSet(s)}
                  {records.has(s.id) && (
                    <TrophyIcon
                      size={14}
                      weight="fill"
                      className="text-accent"
                      aria-label="Recorde"
                    />
                  )}
                </span>
                {s.note && (
                  <span className="block truncate text-xs italic text-muted-foreground">
                    {s.note}
                  </span>
                )}
              </span>
              <button
                onClick={() => setEditing(s)}
                aria-label="Editar série"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <PencilSimpleIcon size={15} />
              </button>
              <button
                onClick={() => onRemoveSet(s.id)}
                aria-label="Remover série"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-destructive"
              >
                <TrashIcon size={15} />
              </button>
            </li>
          ))}
        </ol>
      )}

      {open ? (
        <div className="border-t border-border p-3">
          <LogForm
            bare
            defaultLoadType={exercise.loadType}
            suggestion={
              last && {
                loadType: last.loadType,
                load: last.load,
                reps: last.reps,
              }
            }
            onSave={onAddSet}
          />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-border py-3 text-sm font-semibold text-accent hover:bg-accent/5"
        >
          <PlusIcon size={18} weight="bold" /> Registrar série
        </button>
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
    </li>
  );
}
