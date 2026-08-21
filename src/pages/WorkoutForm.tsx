import { useMemo, useState } from "react";
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { PageProps } from "./shared";
import { MuscleBadge } from "../components/MuscleBadge";
import { cn } from "../lib/format";

interface WorkoutFormProps extends PageProps {
  workoutId?: string;
}

export function WorkoutForm({ store, nav, workoutId }: WorkoutFormProps) {
  const editing = workoutId
    ? store.workouts.find((w) => w.id === workoutId)
    : undefined;
  const [name, setName] = useState(editing?.name ?? "");
  const [selected, setSelected] = useState<string[]>(
    editing?.exerciseIds ?? [],
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...store.exercises]
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true));
  }, [store.exercises, query]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) {
      store.updateWorkout(editing.id, { name, exerciseIds: selected });
      nav.pop();
    } else {
      const wk = store.addWorkout(name, selected);
      if (wk) nav.replace({ t: "workout", id: wk.id });
      else nav.pop();
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

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium">Exercícios</span>
          <span className="font-mono text-xs text-muted-foreground">
            {selected.length} selecionados
          </span>
        </div>

        {store.exercises.length === 0 ? (
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
