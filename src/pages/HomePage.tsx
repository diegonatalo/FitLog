import {
  CaretRightIcon,
  ListChecksIcon,
  PlayIcon,
  PlusIcon,
  PushPinIcon,
} from "@phosphor-icons/react";
import type { MuscleGroup, Workout } from "../types";
import type { PageProps } from "./shared";
import { EmptyState } from "../components/EmptyState";
import { MuscleBadge } from "../components/MuscleBadge";
import { relativeDay, formatTime } from "../lib/format";

export function HomePage({ store, nav }: PageProps) {
  const { workouts, activeSession, exercises } = store;

  const exMap = new Map(exercises.map((e) => [e.id, e]));

  const workoutGroups = (wk: Workout): MuscleGroup[] => {
    const groups: MuscleGroup[] = [];
    for (const id of wk.exerciseIds) {
      const g = exMap.get(id)?.muscleGroup;
      if (g && !groups.includes(g)) groups.push(g);
    }
    return groups.slice(0, 4);
  };

  const start = (wk: Workout) => {
    const session = store.startSession(wk);
    nav.push({ t: "session", id: session.id });
  };

  return (
    <div className="flex flex-col gap-4">
      {activeSession && (
        <button
          onClick={() => nav.push({ t: "session", id: activeSession.id })}
          className="flex items-center gap-3 rounded-2xl border border-accent/50 bg-accent/10 p-4 text-left"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <PlayIcon size={22} weight="fill" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-accent">
              Treino em andamento
            </span>
            <span className="block truncate font-bold">
              {activeSession.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              Iniciado {relativeDay(activeSession.startedAt).toLowerCase()} às{" "}
              {formatTime(activeSession.startedAt)}
            </span>
          </span>
          <CaretRightIcon
            size={20}
            className="shrink-0 text-accent"
            weight="bold"
          />
        </button>
      )}

      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Meus treinos
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {workouts.length}
        </span>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon={PushPinIcon}
          title="Monte seu primeiro treino"
          description="Agrupe os exercícios de um dia (ex: Peito e Tríceps) em um treino para iniciar tudo com um toque."
          action={
            <button
              onClick={() => nav.push({ t: "workoutForm" })}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
            >
              <PlusIcon size={20} weight="bold" /> Criar treino
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {workouts.map((wk) => {
            const groups = workoutGroups(wk);
            const n = wk.exerciseIds.length;
            return (
              <li
                key={wk.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  onClick={() => nav.push({ t: "workout", id: wk.id })}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="mb-1.5 block truncate text-base font-bold">
                      {wk.name}
                    </span>
                    <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ListChecksIcon size={15} weight="bold" />
                      {n} {n === 1 ? "exercício" : "exercícios"}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {groups.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Sem exercícios ainda
                        </span>
                      ) : (
                        groups.map((g) => <MuscleBadge key={g} group={g} />)
                      )}
                    </span>
                  </span>
                  <CaretRightIcon
                    size={18}
                    className="shrink-0 text-muted-foreground"
                    weight="bold"
                  />
                </button>
                <div className="border-t border-border p-2">
                  <button
                    onClick={() => start(wk)}
                    disabled={
                      n === 0 ||
                      (!!activeSession && activeSession.workoutId === wk.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PlayIcon size={18} weight="fill" />
                    {activeSession && activeSession.workoutId === wk.id
                      ? "Em andamento"
                      : "Iniciar treino"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {workouts.length > 0 && (
        <button
          onClick={() => nav.push({ t: "workoutForm" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <PlusIcon size={20} weight="bold" />
          Criar treino
        </button>
      )}
    </div>
  );
}
