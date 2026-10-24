import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { BarbellIcon, CheckCircleIcon } from "@phosphor-icons/react";
import type { Exercise } from "../types";
import { paths } from "../lib/paths";
import { formatClock } from "../lib/format";
import { isNewRecord } from "../lib/stats";
import { useStore } from "../hooks/useStore";
import { useNow } from "../hooks/useNow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RestTimer } from "../components/RestTimer";
import { SessionExerciseCard } from "../components/SessionExerciseCard";

export function SessionScreen() {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);

  const session = store.sessions.find((s) => s.id === id);
  if (!session) return <Navigate to={paths.home} replace />;
  if (session.finishedAt !== null) {
    return <Navigate to={paths.sessionDetail(session.id)} replace />;
  }

  const workout = session.workoutId
    ? store.workouts.find((w) => w.id === session.workoutId)
    : null;
  const exercises = (workout?.exerciseIds ?? [])
    .map((exId) => store.exercises.find((e) => e.id === exId))
    .filter((e): e is Exercise => Boolean(e) && !e?.archived);

  const sessionSets = store.setsBySession.get(session.id) ?? [];
  const totalSets = sessionSets.length;

  const finish = () => {
    store.finishSession(session.id);
    navigate(paths.sessionDetail(session.id), { replace: true });
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Sessão ativa
            </p>
            <p className="mt-0.5 truncate text-lg font-bold">{session.name}</p>
            <p className="text-sm text-muted-foreground">
              {totalSets}{" "}
              {totalSets === 1 ? "série registrada" : "séries registradas"}
            </p>
          </div>
          <p
            className="font-mono text-2xl font-bold tabular-nums"
            aria-label="Tempo de treino"
          >
            {formatClock((now - session.startedAt) / 1000)}
          </p>
        </div>
      </div>

      {restStartedAt !== null && (
        <RestTimer
          key={restStartedAt}
          startedAt={restStartedAt}
          onDismiss={() => setRestStartedAt(null)}
        />
      )}

      {exercises.length === 0 ? (
        <EmptyState
          icon={BarbellIcon}
          title="Treino sem exercícios"
          description="Este treino não possui exercícios. Finalize e edite o treino para adicioná-los."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <SessionExerciseCard
              key={ex.id}
              exercise={ex}
              sets={sessionSets.filter((s) => s.exerciseId === ex.id)}
              history={store.setsByExercise.get(ex.id) ?? []}
              onAddSet={(loadType, load, reps) => {
                const record = isNewRecord(
                  store.setsByExercise.get(ex.id) ?? [],
                  loadType,
                  load,
                );
                store.addSet(ex.id, loadType, load, reps, session.id);
                setRestStartedAt(Date.now());
                return record;
              }}
              onUpdateSet={store.updateSet}
              onRemoveSet={store.removeSet}
            />
          ))}
        </ul>
      )}

      <div>
        <label
          htmlFor="session-note"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Observações do treino (opcional)
        </label>
        <textarea
          id="session-note"
          value={session.note ?? ""}
          onChange={(e) =>
            store.updateSession(session.id, { note: e.target.value })
          }
          rows={2}
          maxLength={500}
          placeholder="Como foi o treino? Dores, energia, sono..."
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <button
        onClick={finish}
        className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-base font-bold text-accent-foreground shadow-lg"
      >
        <CheckCircleIcon size={20} weight="fill" />
        Finalizar treino
      </button>

      <button
        onClick={() => setConfirmDiscard(true)}
        className="mx-auto text-sm font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
      >
        Descartar sessão
      </button>

      {confirmDiscard && (
        <ConfirmDialog
          title="Descartar sessão?"
          description="As séries registradas nesta sessão serão apagadas e o treino não irá para o histórico."
          confirmLabel="Descartar"
          onCancelLabel="Continuar treino"
          onConfirm={() => {
            store.removeSession(session.id);
            navigate(paths.home, { replace: true });
          }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}
