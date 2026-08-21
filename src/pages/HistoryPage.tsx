import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import type { PageProps } from "./shared";
import { EmptyState } from "../components/EmptyState";
import { formatTime, relativeDay } from "../lib/format";

function duration(start: number, end: number): string {
  const mins = Math.max(1, Math.round((end - start) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function HistoryPage({ store, nav }: PageProps) {
  const { finishedSessions } = store;

  if (finishedSessions.length === 0) {
    return (
      <EmptyState
        icon={ClockCounterClockwiseIcon}
        title="Nenhum treino concluído"
        description="Inicie um treino na aba Início e finalize-o para acompanhar sua evolução aqui."
        action={
          <button
            onClick={() => nav.selectTab("home")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
          >
            Ver meus treinos
          </button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {finishedSessions.map((s) => {
        const sets = store.setsBySession.get(s.id) ?? [];
        const exerciseCount = new Set(sets.map((x) => x.exerciseId)).size;
        return (
          <li key={s.id}>
            <button
              onClick={() => nav.push({ t: "sessionDetail", id: s.id })}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
                <ClockCounterClockwiseIcon size={22} weight="fill" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{s.name}</span>
                <span className="block text-xs capitalize text-muted-foreground">
                  {relativeDay(s.startedAt)} · {formatTime(s.startedAt)}
                  {s.finishedAt
                    ? ` · ${duration(s.startedAt, s.finishedAt)}`
                    : ""}
                </span>
                <span className="mt-1.5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecksIcon size={14} weight="bold" /> {exerciseCount}{" "}
                    {exerciseCount === 1 ? "exercício" : "exercícios"}
                  </span>
                  <span className="font-mono">
                    {sets.length} {sets.length === 1 ? "série" : "séries"}
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
  );
}
