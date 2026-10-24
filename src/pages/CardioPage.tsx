import { useState } from "react";
import {
  CheckIcon,
  FireIcon,
  FloppyDiskIcon,
  HeartbeatIcon,
  LightbulbIcon,
  PersonSimpleRunIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { CardioProfile } from "../types";
import { CardioChart } from "../components/CardioChart";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Stepper } from "../components/Stepper";
import { ZONES, estimate, tips } from "../lib/cardio";
import type { CardioInput } from "../lib/cardio";
import { cn, formatDate, formatTime, relativeDay } from "../lib/format";
import { useStore } from "../hooks/useStore";

type ProfileKey = keyof CardioProfile;
type ProfileDraft = Record<ProfileKey, string>;

const PROFILE_FIELDS: {
  key: ProfileKey;
  label: string;
  step: number;
  min: number;
  max: number;
}[] = [
  { key: "weightKg", label: "Peso (kg)", step: 0.5, min: 30, max: 300 },
  { key: "age", label: "Idade (anos)", step: 1, min: 10, max: 100 },
];

/** Returns the profile when every field is filled with a plausible value. */
function parseProfile(draft: ProfileDraft): CardioProfile | null {
  const out = {} as CardioProfile;
  for (const f of PROFILE_FIELDS) {
    const n = Number.parseFloat(draft[f.key]);
    if (!Number.isFinite(n) || n < f.min || n > f.max) return null;
    out[f.key] = n;
  }
  return out;
}

const toDraft = (p: CardioProfile | null): ProfileDraft => ({
  weightKg: p ? String(p.weightKg) : "",
  age: p ? String(p.age) : "",
});

function parseInput(speed: string, incline: string, minutes: string) {
  const input: CardioInput = {
    speedKmh: Number.parseFloat(speed),
    inclinePct: Number.parseFloat(incline),
    minutes: Number.parseFloat(minutes),
  };
  const valid =
    input.speedKmh >= 1 &&
    input.speedKmh <= 25 &&
    input.inclinePct >= 0 &&
    input.inclinePct <= 20 &&
    input.minutes >= 1 &&
    input.minutes <= 300;
  return valid ? input : null;
}

export function CardioPage() {
  const store = useStore();
  const { cardioSessions, cardioProfile } = store;
  const last = cardioSessions[0];

  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(cardioProfile));
  const [speed, setSpeed] = useState(String(last?.speedKmh ?? 6));
  const [incline, setIncline] = useState(String(last?.inclinePct ?? 5));
  const [minutes, setMinutes] = useState(String(last?.minutes ?? 30));
  const [saved, setSaved] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const profile = parseProfile(draft);
  const input = parseInput(speed, incline, minutes);

  const changeProfile = (key: ProfileKey, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    const parsed = parseProfile(next);
    if (parsed) store.saveCardioProfile(parsed);
  };

  const result = profile && input ? estimate(input, profile) : null;

  const save = () => {
    if (!profile || !input || !result) return;
    store.addCardioSession({
      speedKmh: input.speedKmh,
      inclinePct: input.inclinePct,
      minutes: input.minutes,
      weightKg: profile.weightKg,
      kcal: result.kcal,
      avgHr: result.avgHr,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="Seus dados" icon={<HeartbeatIcon size={18} />}>
        <div className="grid grid-cols-2 gap-3">
          {PROFILE_FIELDS.map((f) => (
            <Stepper
              key={f.key}
              label={f.label}
              value={draft[f.key]}
              onChange={(v) => changeProfile(f.key, v)}
              step={f.step}
              min={f.min}
              placeholder="—"
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Preencha peso e idade para calcular. Ficam salvos neste aparelho.
        </p>
      </Card>

      <Card title="Sessão na esteira" icon={<PersonSimpleRunIcon size={18} />}>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Velocidade (km/h)" value={speed} onChange={setSpeed} step={0.1} min={1} />
          <Stepper label="Inclinação (%)" value={incline} onChange={setIncline} step={1} />
          <div className="col-span-2">
            <Stepper label="Tempo (min)" value={minutes} onChange={setMinutes} step={5} min={1} />
          </div>
        </div>
      </Card>

      {result && profile && input ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat
                icon={<FireIcon size={16} weight="fill" />}
                label="Calorias"
                value={result.kcal}
                unit="kcal"
              />
              <Stat
                icon={<HeartbeatIcon size={16} weight="fill" />}
                label="Freq. cardíaca"
                value={result.avgHr}
                unit="bpm"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold">
                  Zona {result.zone.id} · {result.zone.label}
                </span>
                <span className="font-mono text-muted-foreground">
                  {Math.round((result.avgHr / result.maxHr) * 100)}% da FC máx. ({result.maxHr})
                </span>
              </div>
              <div className="mt-1.5 flex gap-1" aria-hidden>
                {ZONES.map((z) => (
                  <span
                    key={z.id}
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      z.id === result.zone.id ? "bg-accent" : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={save}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all",
                saved
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {saved ? (
                <>
                  <CheckIcon size={20} weight="bold" /> Salvo no histórico!
                </>
              ) : (
                <>
                  <FloppyDiskIcon size={20} weight="bold" /> Salvar sessão
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Estimativa com margem de erro de 10–20%. Não substitui orientação
              profissional.
            </p>
          </section>

          <CardioChart input={input} profile={profile} />

          <Card title="Dicas" icon={<LightbulbIcon size={18} />}>
            <ul className="flex flex-col gap-3">
              {tips(input, profile, result).map((t) => (
                <li key={t.title}>
                  <p className="text-sm font-bold">{t.title}</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {t.text}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground text-pretty">
          Informe seus dados e os parâmetros da esteira para ver as calorias, a
          frequência cardíaca estimada e as comparações.
        </p>
      )}

      <History
        onDelete={setToDelete}
      />

      {toDelete && (
        <ConfirmDialog
          title="Excluir sessão?"
          description="Ela será removida do histórico de cardio."
          confirmLabel="Excluir"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.removeCardioSession(toDelete);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function History({ onDelete }: { onDelete: (id: string) => void }) {
  const { cardioSessions } = useStore();

  if (cardioSessions.length === 0) {
    return (
      <EmptyState
        icon={PersonSimpleRunIcon}
        title="Nenhum cardio salvo"
        description="Calcule uma sessão e toque em Salvar sessão para montar seu histórico."
      />
    );
  }

  const totalKcal = cardioSessions.reduce((n, s) => n + s.kcal, 0);
  const totalMin = cardioSessions.reduce((n, s) => n + s.minutes, 0);

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Histórico de cardio
      </h2>
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
                <span className="capitalize">{relativeDay(s.createdAt)}</span>{" "}
                <span className="font-normal text-muted-foreground">
                  · {formatDate(s.createdAt)} {formatTime(s.createdAt)}
                </span>
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                {s.minutes} min · {s.speedKmh} km/h · {s.inclinePct}%
              </span>
            </span>
            <span className="text-right font-mono text-xs">
              <span className="block font-bold">{s.kcal} kcal</span>
              <span className="block text-muted-foreground">~{s.avgHr} bpm</span>
            </span>
            <button
              onClick={() => onDelete(s.id)}
              aria-label="Excluir sessão"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <TrashIcon size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 font-mono text-3xl font-bold leading-none">
        {value}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  );
}
