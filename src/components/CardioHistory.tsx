import { useState } from "react";
import { PersonSimpleRunIcon, TrashIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { paths } from "../lib/paths";
import { formatTime, relativeDay } from "../lib/format";
import { useStore } from "../hooks/useStore";

export function CardioHistory() {
  const { cardioSessions, removeCardioSession } = useStore();
  const [toDelete, setToDelete] = useState<string | null>(null);

  if (cardioSessions.length === 0) {
    return (
      <EmptyState
        icon={PersonSimpleRunIcon}
        title="Nenhum cardio salvo"
        description="Calcule uma sessão na aba Cardio e toque em Salvar sessão para montar seu histórico."
        action={
          <Link
            to={paths.cardio}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
          >
            Abrir calculadora
          </Link>
        }
      />
    );
  }

  const totalKcal = cardioSessions.reduce((n, s) => n + s.kcal, 0);
  const totalMin = cardioSessions.reduce((n, s) => n + s.minutes, 0);

  return (
    <section>
      <p className="mb-3 font-mono text-xs text-muted-foreground">
        {cardioSessions.length}{" "}
        {cardioSessions.length === 1 ? "sessão" : "sessões"} · {totalMin} min ·{" "}
        {totalKcal} kcal
      </p>
      <ul className="flex flex-col gap-2">
        {cardioSessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">
                {relativeDay(s.createdAt)}{" "}
                <span className="font-normal text-muted-foreground">
                  · {formatTime(s.createdAt)}
                </span>
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                {s.minutes} min · {s.speedKmh} km/h · {s.inclinePct}%
              </span>
            </span>
            <span className="text-right font-mono text-xs">
              <span className="block font-bold">{s.kcal} kcal</span>
              <span className="block text-muted-foreground">
                ~{s.avgHr} bpm
              </span>
            </span>
            <button
              onClick={() => setToDelete(s.id)}
              aria-label="Excluir sessão"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <TrashIcon size={18} />
            </button>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="Excluir sessão?"
          description="Ela será removida do histórico de cardio."
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            removeCardioSession(toDelete);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}
