import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router";
import type { PageProps } from "./shared";
import { EmptyState } from "../components/EmptyState";
import { paths } from "../lib/paths";
import { formatDuration, formatTime, relativeDay } from "../lib/format";

export function HistoryPage({ store }: PageProps) {
  const { finishedSessions } = store;

  if (finishedSessions.length === 0) {
    return (
      <EmptyState
        icon={ClockCounterClockwiseIcon}
        title="Nenhum treino concluído"
        description="Inicie um treino na aba Início e finalize-o para acompanhar sua evolução aqui."
        action={
          <Link
            to={paths.home}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
          >
            Ver meus treinos
          </Link>
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
            <Link
              to={paths.sessionDetail(s.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
                <ClockCounterClockwiseIcon size={22} weight="fill" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{s.name}</span>
                <span className="block text-xs text-muted-foreground">
                  <span className="capitalize">{relativeDay(s.startedAt)}</span>{" "}
                  · {formatTime(s.startedAt)}
                  {s.finishedAt
                    ? ` · ${formatDuration(s.startedAt, s.finishedAt)}`
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
