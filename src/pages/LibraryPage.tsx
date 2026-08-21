import { useMemo, useState } from "react";
import {
  BarbellIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { MuscleGroup } from "../types";
import { MUSCLE_GROUPS } from "../types";
import type { PageProps } from "./shared";
import { EmptyState } from "../components/EmptyState";
import { MuscleBadge } from "../components/MuscleBadge";
import { ExerciseForm } from "../components/ExerciseForm";
import { cn } from "../lib/format";

export function LibraryPage({ store, nav }: PageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");
  const [adding, setAdding] = useState(false);

  const usedGroups = useMemo(() => {
    const set = new Set(store.exercises.map((e) => e.muscleGroup));
    return MUSCLE_GROUPS.filter((m) => set.has(m.value));
  }, [store.exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.exercises
      .filter((e) => (filter === "all" ? true : e.muscleGroup === filter))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [store.exercises, query, filter]);

  const hasExercises = store.exercises.length > 0;

  return (
    <div>
      {hasExercises && (
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
              className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-10 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <XIcon size={16} weight="bold" />
              </button>
            )}
          </div>

          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
            <Chip
              label="Todos"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {usedGroups.map((m) => (
              <Chip
                key={m.value}
                label={m.label}
                active={filter === m.value}
                onClick={() => setFilter(m.value)}
              />
            ))}
          </div>
        </>
      )}

      {!hasExercises ? (
        <EmptyState
          icon={BarbellIcon}
          title="Sua biblioteca está vazia"
          description="Cadastre os exercícios que você faz para começar a registrar suas séries e montar treinos."
          action={
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
            >
              <PlusIcon size={20} weight="bold" /> Novo exercício
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="Nenhum exercício encontrado"
          description="Tente outro termo de busca ou remova o filtro de grupo muscular."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((ex) => {
            const count = store.setsByExercise.get(ex.id)?.length ?? 0;
            const last = store.setsByExercise.get(ex.id)?.[0];
            return (
              <li key={ex.id}>
                <button
                  onClick={() => nav.push({ t: "exercise", id: ex.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                    <BarbellIcon size={20} weight="fill" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex items-center gap-2">
                      <span className="truncate font-semibold">{ex.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MuscleBadge group={ex.muscleGroup} />
                      <span className="truncate text-xs text-muted-foreground">
                        {count === 0
                          ? "Sem registros"
                          : `${last?.load}${ex.loadType === "weight" ? " kg" : " placas"} × ${last?.reps} · ${count} ${count === 1 ? "registro" : "registros"}`}
                      </span>
                    </span>
                  </span>
                  <CaretRightIcon
                    size={18}
                    className="shrink-0 text-muted-foreground"
                    weight="bold"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hasExercises && (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <PlusIcon size={20} weight="bold" />
          Novo exercício
        </button>
      )}

      {adding && (
        <ExerciseForm
          onClose={() => setAdding(false)}
          onSubmit={(name, muscleGroup, loadType) => {
            store.addExercise(name, muscleGroup, loadType);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
