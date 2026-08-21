import { useState } from "react";
import {
  BarbellIcon,
  CaretRightIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { PageProps } from "./shared";
import { MuscleBadge } from "../components/MuscleBadge";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface WorkoutDetailProps extends PageProps {
  workoutId: string;
}

export function WorkoutDetail({ store, nav, workoutId }: WorkoutDetailProps) {
  const workout = store.workouts.find((w) => w.id === workoutId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!workout) return null;

  const exercises = workout.exerciseIds
    .map((id) => store.exercises.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const activeHere =
    store.activeSession && store.activeSession.workoutId === workout.id;

  const start = () => {
    if (store.activeSession) {
      nav.push({ t: "session", id: store.activeSession.id });
      return;
    }
    const session = store.startSession(workout);
    nav.push({ t: "session", id: session.id });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <button
          onClick={() => nav.push({ t: "workoutForm", id: workout.id })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm font-medium hover:bg-muted"
        >
          <PencilSimpleIcon size={16} weight="bold" /> Editar
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label="Excluir treino"
          className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
        >
          <TrashIcon size={18} />
        </button>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Exercícios
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {exercises.length}
          </span>
        </div>

        {exercises.length === 0 ? (
          <EmptyState
            icon={BarbellIcon}
            title="Treino sem exercícios"
            description="Edite o treino para adicionar exercícios da sua biblioteca."
            action={
              <button
                onClick={() => nav.push({ t: "workoutForm", id: workout.id })}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
              >
                <PencilSimpleIcon size={18} weight="bold" /> Editar treino
              </button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <li key={ex.id}>
                <button
                  onClick={() => nav.push({ t: "exercise", id: ex.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                    <BarbellIcon size={18} weight="fill" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {ex.name}
                    </span>
                  </span>
                  <MuscleBadge group={ex.muscleGroup} />
                  <CaretRightIcon
                    size={16}
                    className="shrink-0 text-muted-foreground"
                    weight="bold"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={start}
        disabled={exercises.length === 0}
        className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlayIcon size={20} weight="fill" />
        {activeHere ? "Continuar treino" : "Iniciar treino"}
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir treino?"
          description={`"${workout.name}" será removido. Os exercícios e o histórico não são afetados.`}
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.removeWorkout(workout.id);
            nav.pop();
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
