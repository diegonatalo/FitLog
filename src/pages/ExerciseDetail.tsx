import { useMemo, useState } from "react";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { LoadType } from "../types";
import { paths } from "../lib/paths";
import { MuscleBadge } from "../components/MuscleBadge";
import { ExerciseForm } from "../components/ExerciseForm";
import { LogForm } from "../components/LogForm";
import { HistoryList } from "../components/HistoryList";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { PageProps } from "./shared";

export function ExerciseDetail({ store }: PageProps) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const exercise = store.exercises.find((e) => e.id === id);
  const sets = store.setsByExercise.get(id) ?? [];
  const [justSaved, setJustSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const best = useMemo(() => {
    if (sets.length === 0) return null;
    return sets.reduce((max, s) => (s.load > max.load ? s : max), sets[0]);
  }, [sets]);

  if (!exercise) return <Navigate to={paths.library} replace />;

  const handleSave = (loadType: LoadType, load: number, reps: number) => {
    store.addSet(exercise.id, loadType, load, reps);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <MuscleBadge group={exercise.muscleGroup} size="md" />
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <PencilSimpleIcon size={16} weight="bold" /> Editar
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Excluir exercício"
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2">
        <StatCard label="Registros" value={String(sets.length)} />
        <StatCard
          label="Recorde"
          value={
            best
              ? `${best.load}${exercise.loadType === "weight" ? " kg" : "×"}`
              : "—"
          }
          sub={best ? `${best.reps} reps` : undefined}
        />
      </section>

      <LogForm
        defaultLoadType={exercise.loadType}
        onSave={handleSave}
        justSaved={justSaved}
      />

      <HistoryList sets={sets} onRemoveSet={store.removeSet} />

      {editing && (
        <ExerciseForm
          exercise={exercise}
          onClose={() => setEditing(false)}
          onSubmit={(name, muscleGroup, loadType) => {
            store.updateExercise(exercise.id, { name, muscleGroup, loadType });
            setEditing(false);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir exercício?"
          description={`"${exercise.name}" e todos os seus registros serão removidos. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.removeExercise(exercise.id);
            navigate(paths.library, { replace: true });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold leading-none">{value}</p>
      {sub && (
        <p className="mt-1 font-mono text-sm font-medium text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}
