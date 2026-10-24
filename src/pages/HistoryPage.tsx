import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import { Link, useSearchParams } from "react-router";
import { CardioHistory } from "../components/CardioHistory";
import { EmptyState } from "../components/EmptyState";
import { paths } from "../lib/paths";
import { cn, formatDuration, formatTime, relativeDay } from "../lib/format";
import { useStore } from "../hooks/useStore";

type Kind = "treinos" | "cardio";

const KINDS: { value: Kind; label: string }[] = [
  { value: "treinos", label: "Treinos" },
  { value: "cardio", label: "Cardio" },
];

export function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const kind: Kind = params.get("tipo") === "cardio" ? "cardio" : "treinos";

  const select = (next: Kind) =>
    setParams(next === "cardio" ? { tipo: "cardio" } : {}, { replace: true });

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Tipo de histórico"
        className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold"
      >
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => select(k.value)}
            aria-pressed={kind === k.value}
            className={cn(
              "rounded-lg py-2 transition-colors",
              kind === k.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {kind === "cardio" ? <CardioHistory /> : <WorkoutHistory />}
    </div>
  );
}

function WorkoutHistory() {
  const store = useStore();
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
                  {relativeDay(s.startedAt)}{" "}
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
