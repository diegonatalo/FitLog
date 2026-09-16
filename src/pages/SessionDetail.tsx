import { ClockCounterClockwiseIcon, BarbellIcon } from "@phosphor-icons/react";
import type { WorkoutSet } from "../types";
import { useStore } from "./shared";
import { formatDuration, formatTime, relativeDay } from "../lib/format";
import { useParams } from "react-router";

export function SessionDetail() {
  const store = useStore();
  const { id = "" } = useParams();
  const session = store.sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="p-1">
        <p className="text-muted-foreground">Sessão não encontrada.</p>
      </div>
    );
  }

  const sets = store.setsBySession.get(session.id) ?? [];

  const groups = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
    (acc[set.exerciseId] ??= []).push(set);
    return acc;
  }, {});

  const exerciseName = (id: string) =>
    store.exercises.find((e) => e.id === id)?.name ?? "Exercício removido";
  const totalSets = sets.length;

  return (
    <div className="pb-24">
      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStat label="Séries" value={String(totalSets)} />
        <SummaryStat
          label="Exercícios"
          value={String(Object.keys(groups).length)}
        />
        <SummaryStat
          label="Duração"
          value={
            session.finishedAt
              ? formatDuration(session.startedAt, session.finishedAt)
              : "—"
          }
        />
      </div>

      <p className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ClockCounterClockwiseIcon size={16} weight="bold" />
        <span className="capitalize">
          {relativeDay(session.startedAt)}
        </span> · {formatTime(session.startedAt)}
      </p>

      {Object.keys(groups).length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma série registrada nesta sessão.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groups).map(([exerciseId, entries]) => (
            <div
              key={exerciseId}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="mb-3 flex items-center gap-2 font-semibold">
                <BarbellIcon size={18} weight="fill" className="text-primary" />
                {exerciseName(exerciseId)}
              </p>
              <ul className="flex flex-col gap-1.5">
                {entries.map((entry, i) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between border-b border-border/50 pb-1.5 text-sm last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground">Série {i + 1}</span>
                    <span className="font-mono font-medium">
                      {entry.load}
                      {entry.loadType === "weight" ? " kg" : " placas"} ·{" "}
                      {entry.reps} reps
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3 text-center">
      <span className="font-mono text-xl font-bold leading-none">{value}</span>
      <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
