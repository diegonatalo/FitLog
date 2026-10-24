import { useState } from "react";
import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { LoadType, WorkoutSet } from "../types";
import { loadTypeMeta } from "../types";
import { paths } from "../lib/paths";
import { formatLoad } from "../lib/format";
import { bestSet, estimateOneRepMax, isNewRecord } from "../lib/stats";
import { useStore } from "../hooks/useStore";
import { MuscleBadge } from "../components/MuscleBadge";
import { ExerciseForm } from "../components/ExerciseForm";
import { LogForm } from "../components/LogForm";
import { HistoryList } from "../components/HistoryList";
import { ProgressChart } from "../components/ProgressChart";
import { ConfirmDialog } from "../components/ConfirmDialog";

const NO_SETS: WorkoutSet[] = [];

export function ExerciseDetail() {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const exercise = store.exercises.find((e) => e.id === id);
  const sets = store.setsByExercise.get(id) ?? NO_SETS;
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);

  if (!exercise) return <Navigate to={paths.library} replace />;

  const archived = exercise.archived === true;
  const hasHistory = sets.length > 0;
  const best = bestSet(sets, exercise.loadType);
  const meta = loadTypeMeta(exercise.loadType);
  const oneRepMax =
    best && exercise.loadType === "weight"
      ? estimateOneRepMax(best.load, best.reps)
      : null;
  const last = sets[0];

  const handleSave = (loadType: LoadType, load: number, reps: number) => {
    const record = isNewRecord(sets, loadType, load);
    store.addSet(exercise.id, loadType, load, reps);
    return record;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <MuscleBadge group={exercise.muscleGroup} size="md" />
          {archived && (
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Arquivado
            </span>
          )}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <PencilSimpleIcon size={16} weight="bold" /> Editar
          </button>
          {archived ? (
            <>
              <button
                onClick={() => store.restoreExercise(exercise.id)}
                aria-label="Restaurar exercício"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <ArrowCounterClockwiseIcon size={16} weight="bold" />
              </button>
              <button
                onClick={() => setConfirm("delete")}
                aria-label="Excluir definitivamente"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
              >
                <TrashIcon size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirm(hasHistory ? "archive" : "delete")}
              aria-label={hasHistory ? "Arquivar exercício" : "Excluir exercício"}
              className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            >
              {hasHistory ? <ArchiveIcon size={16} /> : <TrashIcon size={16} />}
            </button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2">
        <StatCard label="Registros" value={String(sets.length)} />
        <StatCard
          label="Recorde"
          value={best ? formatLoad(best.loadType, best.load) : "—"}
          sub={best && meta.hasReps ? `${best.reps} reps` : undefined}
        />
        {oneRepMax !== null && (
          <StatCard
            label="1RM estimado"
            value={formatLoad("weight", oneRepMax)}
            className="col-span-2"
          />
        )}
      </section>

      {!archived && (
        <LogForm
          defaultLoadType={exercise.loadType}
          suggestion={
            last && {
              loadType: last.loadType,
              load: last.load,
              reps: last.reps,
            }
          }
          onSave={handleSave}
        />
      )}

      <ProgressChart sets={sets} loadType={exercise.loadType} />

      <HistoryList
        sets={sets}
        onRemoveSet={store.removeSet}
        onUpdateSet={store.updateSet}
      />

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

      {confirm === "archive" && (
        <ConfirmDialog
          title="Arquivar exercício?"
          description={`"${exercise.name}" some da biblioteca e dos novos treinos, mas o histórico de ${sets.length} ${sets.length === 1 ? "registro é mantido" : "registros é mantido"}. Você pode restaurá-lo depois.`}
          confirmLabel="Arquivar"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.archiveExercise(exercise.id);
            navigate(paths.library, { replace: true });
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === "delete" && (
        <ConfirmDialog
          title="Excluir exercício?"
          description={
            hasHistory
              ? `"${exercise.name}" e todos os seus registros serão apagados, inclusive das sessões do histórico. Essa ação não pode ser desfeita.`
              : `"${exercise.name}" será removido da biblioteca e dos treinos.`
          }
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.removeExercise(exercise.id);
            navigate(paths.library, { replace: true });
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card p-4 ${className}`}
    >
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
