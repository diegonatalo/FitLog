import type { Exercise, Workout, WorkoutSession, WorkoutSet } from "../types";

const EXERCISES_KEY = "treino-log:exercises:v1";
const SETS_KEY = "treino-log:sets:v1";
const WORKOUTS_KEY = "treino-log:workouts:v1";
const SESSIONS_KEY = "treino-log:sessions:v1";
export const THEME_KEY = "treino-log:theme:v1";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Seed exercises. Order in this array defines their display order; `createdAt`
// is derived from the index so it stays stable regardless of when it's read.
const SEED_EXERCISES: Omit<Exercise, "createdAt">[] = [
  { id: "ex-supino-reto", name: "Supino reto", muscleGroup: "peito", loadType: "weight" },
  { id: "ex-supino-inclinado", name: "Supino inclinado", muscleGroup: "peito", loadType: "weight" },
  { id: "ex-voador", name: "Voador", muscleGroup: "peito", loadType: "plates" },
  { id: "ex-agachamento-smith", name: "Agachamento no smith", muscleGroup: "pernas", loadType: "weight" },
  { id: "ex-leg-press-45", name: "Leg press 45°", muscleGroup: "pernas", loadType: "weight" },
  { id: "ex-hack", name: "Hack", muscleGroup: "pernas", loadType: "weight" },
  { id: "ex-cadeira-extensora", name: "Cadeira extensora", muscleGroup: "pernas", loadType: "plates" },
  { id: "ex-cadeira-flexora", name: "Cadeira flexora", muscleGroup: "pernas", loadType: "plates" },
  { id: "ex-cadeira-adutora", name: "Cadeira adutora", muscleGroup: "pernas", loadType: "plates" },
  { id: "ex-panturrilha", name: "Panturrilha", muscleGroup: "pernas", loadType: "plates" },
  { id: "ex-elevacao-pelvica", name: "Elevação pélvica", muscleGroup: "gluteos", loadType: "weight" },
  { id: "ex-puxador-frente-barra", name: "Puxador frente (barra)", muscleGroup: "costas", loadType: "plates" },
  { id: "ex-puxador-frente-triangulo", name: "Puxador frente (triângulo)", muscleGroup: "costas", loadType: "plates" },
  { id: "ex-remada-alta", name: "Remada alta", muscleGroup: "costas", loadType: "plates" },
  { id: "ex-remada-baixa", name: "Remada baixa", muscleGroup: "costas", loadType: "plates" },
  { id: "ex-face-pull", name: "Face pull", muscleGroup: "costas", loadType: "plates" },
  { id: "ex-elevacao-lateral", name: "Elevação lateral", muscleGroup: "ombros", loadType: "plates" },
  { id: "ex-desenvolvimento-halteres", name: "Desenvolvimento com halteres", muscleGroup: "ombros", loadType: "weight" },
  { id: "ex-rosca-direta", name: "Rosca direta", muscleGroup: "biceps", loadType: "weight" },
  { id: "ex-rosca-scott", name: "Rosca scott", muscleGroup: "biceps", loadType: "plates" },
  { id: "ex-triceps-corda", name: "Tríceps corda", muscleGroup: "triceps", loadType: "plates" },
  { id: "ex-triceps-frances", name: "Tríceps frânces", muscleGroup: "triceps", loadType: "plates" },
  { id: "ex-abdomen-supra", name: "Abdominal supra", muscleGroup: "abdomen", loadType: "weight" },
  { id: "ex-abdomen-infra", name: "Abdominal infra", muscleGroup: "abdomen", loadType: "weight" },
  { id: "ex-esteira", name: "Esteira inclinada", muscleGroup: "cardio", loadType: "weight" },
];

const DEFAULT_EXERCISES: Exercise[] = SEED_EXERCISES.map((e, i) => ({
  ...e,
  createdAt: i,
}));

const SEED_WORKOUTS: Omit<Workout, "createdAt">[] = [
  {
    id: "wk-push",
    name: "Push",
    exerciseIds: [
      "ex-supino-reto",
      "ex-voador",
      "ex-elevacao-lateral",
      "ex-triceps-corda",
      "ex-triceps-frances",
    ],
  },
  {
    id: "wk-pull",
    name: "Pull",
    exerciseIds: [
      "ex-puxador-frente-barra",
      "ex-remada-baixa",
      "ex-face-pull",
      "ex-rosca-direta",
      "ex-rosca-scott",
    ],
  },
  {
    id: "wk-legs",
    name: "Legs",
    exerciseIds: [
      "ex-agachamento-smith",
      "ex-elevacao-pelvica",
      "ex-cadeira-flexora",
      "ex-cadeira-extensora",
      "ex-cadeira-adutora",
      "ex-panturrilha",
    ],
  },
];

const DEFAULT_WORKOUTS: Workout[] = SEED_WORKOUTS.map((w, i) => ({
  ...w,
  createdAt: i,
}));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist a value under `key`. Fails silently on quota / private-mode errors.
 */
export function saveState<T>(key: StorageKey, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

/**
 * Load a persisted value. When nothing is stored yet, the seed default (if any)
 * is written back and returned, so first-run data is available immediately.
 * Exercises are additionally migrated to guarantee a `muscleGroup`.
 */
export function loadState<T>(key: StorageKey): T {
  const seed = SEEDS[key] as T;
  const existing = read<T | null>(key, null);
  if (existing == null) {
    if (seed !== undefined) saveState(key, seed);
    return seed;
  }
  if (key === EXERCISES_KEY && Array.isArray(existing)) {
    return (existing as Exercise[]).map((e) => ({
      ...e,
      muscleGroup: e.muscleGroup ?? "outro",
    })) as T;
  }
  return existing;
}

export type StorageKey =
  | typeof EXERCISES_KEY
  | typeof SETS_KEY
  | typeof WORKOUTS_KEY
  | typeof SESSIONS_KEY;

/** Default value written for each key on first run. */
export const SEEDS: Record<StorageKey, unknown> = {
  [EXERCISES_KEY]: DEFAULT_EXERCISES,
  [SETS_KEY]: [] as WorkoutSet[],
  [WORKOUTS_KEY]: DEFAULT_WORKOUTS,
  [SESSIONS_KEY]: [] as WorkoutSession[],
};

export const STORAGE_KEYS = {
  exercises: EXERCISES_KEY,
  sets: SETS_KEY,
  workouts: WORKOUTS_KEY,
  sessions: SESSIONS_KEY,
} as const;
