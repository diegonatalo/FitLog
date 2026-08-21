import { useState } from "react";
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Exercise, LoadType, WorkoutSet } from "../types";
import type { PageProps } from "./shared";
import { MuscleBadge } from "../components/MuscleBadge";
import { LogForm } from "../components/LogForm";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Barbell } from "@phosphor-icons/react";

interface SessionScreenProps extends PageProps {
  sessionId: string;
}

export function SessionScreen({ store, nav, sessionId }: SessionScreenProps) {
  const session = store.sessions.find((s) => s.id === sessionId);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!session) return null;

  const workout = session.workoutId
    ? store.workouts.find((w) => w.id === session.workoutId)
    : null;
  const exercises = (workout?.exerciseIds ?? [])
    .map((id) => store.exercises.find((e) => e.id === id))
    .filter((e): e is Exercise => Boolean(e));

  const sessionSets = store.setsBySession.get(sessionId) ?? [];
  const totalSets = sessionSets.length;

  const finish = () => {
    store.finishSession(sessionId);
    nav.selectTab("history");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Sessão ativa
        </p>
        <p className="mt-0.5 text-lg font-bold">{session.name}</p>
        <p className="text-sm text-muted-foreground">
          {totalSets}{" "}
          {totalSets === 1 ? "série registrada" : "séries registradas"}
        </p>
      </div>

      {exercises.length === 0 ? (
        <EmptyState
          icon={Barbell}
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
              onAddSet={(loadType, load, reps) =>
                store.addSet(ex.id, loadType, load, reps, sessionId)
              }
              onRemoveSet={store.removeSet}
            />
          ))}
        </ul>
      )}

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
            store.removeSession(sessionId);
            nav.selectTab("home");
          }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}

interface CardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  onAddSet: (loadType: LoadType, load: number, reps: number) => void;
  onRemoveSet: (id: string) => void;
}

function SessionExerciseCard({
  exercise,
  sets,
  onAddSet,
  onRemoveSet,
}: CardProps) {
  const [open, setOpen] = useState(false);
  const ordered = [...sets].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
          <Barbell size={18} weight="fill" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{exercise.name}</span>
          <span className="text-xs text-muted-foreground">
            {sets.length} {sets.length === 1 ? "série" : "séries"}
          </span>
        </span>
        <MuscleBadge group={exercise.muscleGroup} />
      </div>

      {ordered.length > 0 && (
        <ol className="flex flex-col gap-1.5 px-4 pb-3">
          {ordered.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"
            >
              <span className="grid size-6 place-items-center rounded-md bg-background font-mono text-xs font-bold">
                {i + 1}
              </span>
              <span className="flex-1 font-mono font-semibold">
                {s.load}
                <span className="font-sans font-normal text-muted-foreground">
                  {s.loadType === "weight" ? " kg" : " placas"}
                </span>{" "}
                × {s.reps}
              </span>
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
            defaultLoadType={exercise.loadType}
            justSaved={false}
            onSave={(loadType, load, reps) => {
              onAddSet(loadType, load, reps);
            }}
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
    </li>
  );
}
