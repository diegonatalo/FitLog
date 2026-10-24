import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Navigate, useNavigate, useParams } from "react-router";
import { MuscleBadge } from "../components/MuscleBadge";
import { cn } from "../lib/format";
import { paths } from "../lib/paths";
import { useStore } from "../hooks/useStore";

export function WorkoutForm() {
  const store = useStore();
  const { id } = useParams();
  const editing = id ? store.workouts.find((w) => w.id === id) : undefined;

  // remount when the edited workout changes so the form state restarts
  if (id && !editing) return <Navigate to={paths.home} replace />;
  return <WorkoutFormBody key={editing?.id ?? "new"} workoutId={editing?.id} />;
}

function WorkoutFormBody({ workoutId }: { workoutId?: string }) {
  const store = useStore();
  const navigate = useNavigate();
  const editing = workoutId
    ? store.workouts.find((w) => w.id === workoutId)
    : undefined;
  const [name, setName] = useState(editing?.name ?? "");
  // archived exercises can't be added, but ones already in the workout stay
  const [selected, setSelected] = useState<string[]>(
    editing?.exerciseIds ?? [],
  );
  const [query, setQuery] = useState("");

  const exerciseById = useMemo(
    () => new Map(store.exercises.map((e) => [e.id, e])),
    [store.exercises],
  );

  const picked = selected
    .map((exId) => exerciseById.get(exId))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...store.activeExercises]
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true));
  }, [store.activeExercises, query]);

  const toggle = (exId: string) =>
    setSelected((prev) =>
      prev.includes(exId) ? prev.filter((x) => x !== exId) : [...prev, exId],
    );

  const move = (index: number, delta: -1 | 1) =>
    setSelected((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    // drop ids of exercises that no longer exist
    const exerciseIds = selected.filter((exId) => exerciseById.has(exId));
    if (editing) {
      store.updateWorkout(editing.id, { name, exerciseIds });
      navigate(-1);
    } else {
      const wk = store.addWorkout(name, exerciseIds);
      if (wk) navigate(paths.workout(wk.id), { replace: true });
      else navigate(-1);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="wk-name">
          Nome do treino
        </label>
        <input
          id="wk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Ex: Treino A — Peito e Tríceps"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {picked.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium">Ordem do treino</span>
            <span className="font-mono text-xs text-muted-foreground">
              {picked.length} {picked.length === 1 ? "exercício" : "exercícios"}
            </span>
          </div>
          <ol className="flex flex-col gap-2">
            {picked.map((ex, i) => (
              <li
                key={ex.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs font-bold">
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate font-semibold",
                    ex.archived && "text-muted-foreground line-through",
                  )}
                >
                  {ex.name}
                </span>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Subir ${ex.name}`}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUpIcon size={16} weight="bold" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === picked.length - 1}
                  aria-label={`Descer ${ex.name}`}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDownIcon size={16} weight="bold" />
                </button>
                <button
                  onClick={() => toggle(ex.id)}
                  aria-label={`Remover ${ex.name}`}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium">Adicionar da biblioteca</span>
        </div>

        {store.activeExercises.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Nenhum exercício na biblioteca.
            <br />
            Cadastre exercícios na aba Biblioteca primeiro.
          </p>
        ) : (
          <>
            <div className="relative mb-3">
              <MagnifyingGlassIcon
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar exercício..."
                aria-label="Buscar exercício"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-11 pr-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <ul className="flex flex-col gap-2">
              {filtered.map((ex) => {
                const on = selected.includes(ex.id);
                return (
                  <li key={ex.id}>
                    <button
                      onClick={() => toggle(ex.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                        on
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-md border transition-colors",
                          on
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {on && <CheckIcon size={16} weight="bold" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {ex.name}
                      </span>
                      <MuscleBadge group={ex.muscleGroup} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <button
        onClick={save}
        disabled={!canSave}
        className="sticky bottom-4 w-full rounded-xl bg-accent py-4 text-base font-bold text-accent-foreground shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {editing ? "Salvar treino" : "Criar treino"}
      </button>
    </div>
  );
}
