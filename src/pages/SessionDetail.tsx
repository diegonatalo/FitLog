import { useState } from "react";
import {
  BarbellIcon,
  ClockCounterClockwiseIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { WorkoutSet } from "../types";
import { formatDuration, formatSet, formatTime, relativeDay } from "../lib/format";
import { paths } from "../lib/paths";
import { useStore } from "../hooks/useStore";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function SessionDetail() {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const session = store.sessions.find((s) => s.id === id);

  if (!session) return <Navigate to={paths.history} replace />;
  if (session.finishedAt === null) {
    return <Navigate to={paths.session(session.id)} replace />;
  }

  const sets = store.setsBySession.get(session.id) ?? [];

  const groups = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
    (acc[set.exerciseId] ??= []).push(set);
    return acc;
  }, {});

  const exerciseName = (exId: string) =>
    store.exercises.find((e) => e.id === exId)?.name ?? "Exercício removido";

  return (
    <div className="pb-24">
      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStat label="Séries" value={String(sets.length)} />
        <SummaryStat
          label="Exercícios"
          value={String(Object.keys(groups).length)}
        />
        <SummaryStat
          label="Duração"
          value={formatDuration(session.startedAt, session.finishedAt)}
        />
      </div>

      <p className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ClockCounterClockwiseIcon size={16} weight="bold" />
        <span className="capitalize">{relativeDay(session.startedAt)}</span> ·{" "}
        {formatTime(session.startedAt)}
      </p>

      {session.note && (
        <p className="mb-4 flex gap-2 rounded-xl border border-border bg-card p-3.5 text-sm text-muted-foreground">
          <NotePencilIcon size={18} className="mt-0.5 shrink-0" />
          <span className="whitespace-pre-wrap">{session.note}</span>
        </p>
      )}

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
                    className="border-b border-border/50 pb-1.5 text-sm last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Série {i + 1}
                      </span>
                      <span className="font-mono font-medium">
                        {formatSet(entry)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs italic text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setConfirmDelete(true)}
        className="mx-auto mt-8 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive"
      >
        <TrashIcon size={16} /> Excluir sessão
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir sessão?"
          description="A sessão e todas as séries registradas nela serão apagadas. Essa ação não pode ser desfeita."
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.removeSession(session.id);
            navigate(paths.history, { replace: true });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
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
