import type { CardioProfile, Sex } from "../types";

/**
 * Treadmill estimates. Oxygen cost comes from the ACSM walking/running
 * equations; heart rate is derived from the share of the heart-rate reserve
 * that the effort demands. Both are population averages, not measurements.
 */

/** Above this speed the running equation replaces the walking one. */
const RUN_THRESHOLD_KMH = 8;
const RESTING_VO2 = 3.5; // ml/kg/min
const KCAL_PER_LITRE_O2 = 5;
/** Typical adult resting heart rate, used because most people do not know theirs. */
const RESTING_HR = 70;

export interface CardioInput {
  speedKmh: number;
  inclinePct: number;
  minutes: number;
}

export interface Zone {
  id: 1 | 2 | 3 | 4 | 5;
  label: string;
  /** lower bound of the zone, as a fraction of the heart-rate reserve */
  from: number;
}

export const ZONES: Zone[] = [
  { id: 1, label: "Muito leve", from: 0 },
  { id: 2, label: "Leve", from: 0.4 },
  { id: 3, label: "Moderada", from: 0.6 },
  { id: 4, label: "Intensa", from: 0.8 },
  { id: 5, label: "Máxima", from: 0.9 },
];

export interface CardioEstimate {
  /** oxygen cost, ml/kg/min */
  vo2: number;
  kcal: number;
  kcalPerMin: number;
  avgHr: number;
  maxHr: number;
  /** effort as a fraction (0–1) of the heart-rate reserve */
  intensity: number;
  zone: Zone;
}

/** Tanaka for men, Gulati (developed on women) for women. */
export const maxHeartRate = (age: number, sex: Sex) =>
  Math.round(sex === "female" ? 206 - 0.88 * age : 208 - 0.7 * age);

export function oxygenCost({ speedKmh, inclinePct }: CardioInput): number {
  const metresPerMin = (speedKmh * 1000) / 60;
  const grade = inclinePct / 100;
  return speedKmh < RUN_THRESHOLD_KMH
    ? RESTING_VO2 + 0.1 * metresPerMin + 1.8 * metresPerMin * grade
    : RESTING_VO2 + 0.2 * metresPerMin + 0.9 * metresPerMin * grade;
}

export function zoneFor(intensity: number): Zone {
  return [...ZONES].reverse().find((z) => intensity >= z.from) ?? ZONES[0];
}

export function estimate(
  input: CardioInput,
  profile: CardioProfile,
): CardioEstimate {
  const vo2 = oxygenCost(input);
  const kcalPerMin =
    (vo2 * profile.weightKg * KCAL_PER_LITRE_O2) / 1000;

  const maxHr = maxHeartRate(profile.age, profile.sex);
  const rest = Math.min(RESTING_HR, maxHr - 1);
  // Uth–Sørensen: VO2max ≈ 15.3 × HRmax / HRrest
  const vo2Max = (15.3 * maxHr) / rest;
  const intensity = Math.min(
    1,
    Math.max(0, (vo2 - RESTING_VO2) / (vo2Max - RESTING_VO2)),
  );
  const avgHr = Math.round(rest + intensity * (maxHr - rest));

  return {
    vo2,
    kcal: Math.round(kcalPerMin * input.minutes),
    kcalPerMin,
    avgHr,
    maxHr,
    intensity,
    zone: zoneFor(intensity),
  };
}

/* ---------- Comparison chart ---------- */

export type Metric = "kcal" | "hr";

export interface CurvePoint {
  speed: number;
  value: number;
}

export interface Curve {
  incline: number;
  points: CurvePoint[];
}

const BASE_INCLINES = [0, 6, 12, 18];

/** One curve per incline over a speed range, always including the user's. */
export function compare(
  input: CardioInput,
  profile: CardioProfile,
  metric: Metric,
): { curves: Curve[]; speeds: number[] } {
  const lo = Math.min(3, Math.floor(input.speedKmh));
  const hi = Math.max(12, Math.ceil(input.speedKmh));
  const speeds: number[] = [];
  for (let s = lo; s <= hi; s += 0.5) speeds.push(s);

  const inclines = [...new Set([...BASE_INCLINES, input.inclinePct])].sort(
    (a, b) => a - b,
  );
  const curves = inclines.map((incline) => ({
    incline,
    points: speeds.map((speed) => {
      const e = estimate({ ...input, speedKmh: speed, inclinePct: incline }, profile);
      return { speed, value: metric === "kcal" ? e.kcal : e.avgHr };
    }),
  }));
  return { curves, speeds };
}

/* ---------- Tips ---------- */

export interface Tip {
  title: string;
  text: string;
}

const ZONE_TIPS: Record<Zone["id"], Tip> = {
  1: {
    title: "Ritmo de aquecimento",
    text: "Intensidade muito baixa: ótima para aquecer ou recuperar, mas pouco estímulo cardiovascular. Para treinar de fato, suba a inclinação ou a velocidade até a zona leve ou moderada.",
  },
  2: {
    title: "Zona de base",
    text: "Você consegue conversar sem esforço. É a zona ideal para construir resistência aeróbica e dá para sustentá-la por 40 a 60 minutos com boa recuperação.",
  },
  3: {
    title: "Zona aeróbica",
    text: "Esforço firme, mas controlado: a conversa já fica entrecortada. Ótima para melhorar o condicionamento em sessões de 25 a 40 minutos.",
  },
  4: {
    title: "Zona intensa",
    text: "Falar vira difícil. É um estímulo forte, mas curto: prefira blocos de 3 a 5 minutos intercalados com descanso leve, em vez de manter o ritmo o tempo todo.",
  },
  5: {
    title: "Perto do limite",
    text: "Esforço quase máximo, só sustentável por poucos minutos. Use apenas em tiros curtos e reduza o ritmo se sentir tontura ou falta de ar fora do normal.",
  },
};

export function tips(
  input: CardioInput,
  profile: CardioProfile,
  result: CardioEstimate,
): Tip[] {
  const out: Tip[] = [ZONE_TIPS[result.zone.id]];

  if (result.zone.id <= 2) {
    const steeper = estimate(
      { ...input, inclinePct: Math.min(20, input.inclinePct + 3) },
      profile,
    );
    const extra = steeper.kcal - result.kcal;
    if (extra > 0 && input.inclinePct < 20) {
      out.push({
        title: "Mais gasto sem correr",
        text: `Subir 3% de inclinação mantendo a velocidade adiciona cerca de ${extra} kcal na sessão e leva a FC para ~${steeper.avgHr} bpm.`,
      });
    }
  }

  if (input.inclinePct >= 8 && input.speedKmh < RUN_THRESHOLD_KMH) {
    out.push({
      title: "Solte as barras",
      text: "Em inclinações altas, apoiar-se no corrimão reduz bastante o gasto real e deixa a estimativa otimista demais. Mantenha o tronco ereto e os braços soltos.",
    });
  }

  if (input.minutes < 20 && result.zone.id <= 3) {
    out.push({
      title: "Tempo de sessão",
      text: "Para esse nível de esforço, 25 a 45 minutos rendem melhor. Se o tempo é curto, aumente a intensidade em vez de apenas esperar.",
    });
  } else if (input.minutes > 60 && result.zone.id >= 4) {
    out.push({
      title: "Sessão longa demais",
      text: "Manter esse esforço por mais de uma hora é desgastante. Reduza a intensidade para a zona 2 ou divida o treino.",
    });
  }

  return out;
}
