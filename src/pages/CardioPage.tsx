import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  CheckIcon,
  FireIcon,
  FloppyDiskIcon,
  GearSixIcon,
  HeartbeatIcon,
  LightbulbIcon,
  PersonSimpleRunIcon,
} from "@phosphor-icons/react";
import { CardioChart } from "../components/CardioChart";
import { Stepper } from "../components/Stepper";
import { ZONES, estimate, tips } from "../lib/cardio";
import type { CardioInput } from "../lib/cardio";
import { cn } from "../lib/format";
import { paths } from "../lib/paths";
import { useStore } from "../hooks/useStore";

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
  const { cardioSessions, cardioProfile: profile } = store;
  const last = cardioSessions[0];

  const [speed, setSpeed] = useState(String(last?.speedKmh ?? 6));
  const [incline, setIncline] = useState(String(last?.inclinePct ?? 5));
  const [minutes, setMinutes] = useState(String(last?.minutes ?? 30));
  const [saved, setSaved] = useState(false);

  const input = parseInput(speed, incline, minutes);
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
      {profile ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <p className="font-mono text-sm text-muted-foreground">
            {profile.weightKg} kg · {profile.age} anos ·{" "}
            {profile.sex === "male" ? "masc." : "fem."}
          </p>
          <Link
            to={paths.settings}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
          >
            <GearSixIcon size={16} weight="bold" /> Editar perfil
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground text-pretty">
            Para estimar calorias e frequência cardíaca, preencha seu perfil
            (peso, idade e sexo) nos Ajustes.
          </p>
          <Link
            to={paths.settings}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-bold text-accent-foreground"
          >
            Preencher perfil
          </Link>
        </div>
      )}

      <Card title="Sessão na esteira" icon={<PersonSimpleRunIcon size={18} />}>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Velocidade (km/h)" value={speed} onChange={setSpeed} step={0.1} min={1} />
          <Stepper label="Inclinação (%)" value={incline} onChange={setIncline} step={1} />
          <div className="col-span-2">
            <Stepper label="Tempo (min)" value={minutes} onChange={setMinutes} step={5} min={1} />
          </div>
        </div>
      </Card>

      {result && profile && input && (
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
      )}
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
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
  icon: ReactNode;
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
