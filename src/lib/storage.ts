import type { Exercise, Workout, WorkoutSession, WorkoutSet } from "../types";

const EXERCISES_KEY = "treino-log:exercises:v1";
const SETS_KEY = "treino-log:sets:v1";
const WORKOUTS_KEY = "treino-log:workouts:v1";
const SESSIONS_KEY = "treino-log:sessions:v1";
export const THEME_KEY = "treino-log:theme:v1";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: "ex-supino-reto",
    name: "Supino reto",
    muscleGroup: "peito",
    loadType: "weight",
    createdAt: Date.now(),
  },
  {
    id: "ex-supino-inclinado",
    name: "Supino inclinado",
    muscleGroup: "peito",
    loadType: "weight",
    createdAt: Date.now(),
  },
  {
    id: "ex-voador",
    name: "Voador",
    muscleGroup: "peito",
    loadType: "plates",
    createdAt: Date.now(),
  },
  {
    id: "ex-agachamento-smith",
    name: "Agachamento no smith",
    muscleGroup: "pernas",
    loadType: "weight",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-leg-press-45",
    name: "Leg press 45°",
    muscleGroup: "pernas",
    loadType: "weight",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-hack",
    name: "Hack",
    muscleGroup: "pernas",
    loadType: "weight",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-cadeira-extensora",
    name: "Cadeira extensora",
    muscleGroup: "pernas",
    loadType: "plates",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-cadeira-flexora",
    name: "Cadeira flexora",
    muscleGroup: "pernas",
    loadType: "plates",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-cadeira-adutora",
    name: "Cadeira adutora",
    muscleGroup: "pernas",
    loadType: "plates",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-panturrilha",
    name: "Panturrilha",
    muscleGroup: "pernas",
    loadType: "plates",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-elevacao-pelvica",
    name: "Elevação pélvica",
    muscleGroup: "gluteos",
    loadType: "weight",
    createdAt: Date.now() + 1,
  },
  {
    id: "ex-puxador-frente-barra",
    name: "Puxador frente (barra)",
    muscleGroup: "costas",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-puxador-frente-triangulo",
    name: "Puxador frente (triângulo)",
    muscleGroup: "costas",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-remada-alta",
    name: "Remada alta",
    muscleGroup: "costas",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-remada-baixa",
    name: "Remada baixa",
    muscleGroup: "costas",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-face-pull",
    name: "Face pull",
    muscleGroup: "costas",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-elevacao-lateral",
    name: "Elevação lateral",
    muscleGroup: "ombros",
    loadType: "plates",
    createdAt: Date.now() + 3,
  },
  {
    id: "ex-desenvolvimento-halteres",
    name: "Desenvolvimento com halteres",
    muscleGroup: "ombros",
    loadType: "weight",
    createdAt: Date.now() + 5,
  },
  {
    id: "ex-rosca-direta",
    name: "Rosca direta",
    muscleGroup: "biceps",
    loadType: "weight",
    createdAt: Date.now() + 2,
  },
  {
    id: "ex-rosca-scott",
    name: "Rosca scott",
    muscleGroup: "biceps",
    loadType: "plates",
    createdAt: Date.now() + 2,
  },
  {
    id: "ex-triceps-corda",
    name: "Tríceps corda",
    muscleGroup: "triceps",
    loadType: "plates",
    createdAt: Date.now() + 4,
  },
  {
    id: "ex-triceps-frances",
    name: "Tríceps frânces",
    muscleGroup: "triceps",
    loadType: "plates",
    createdAt: Date.now() + 4,
  },
  {
    id: "ex-abdomen-supra",
    name: "Abdominal supra",
    muscleGroup: "abdomen",
    loadType: "weight",
    createdAt: Date.now() + 4,
  },
  {
    id: "ex-abdomen-infra",
    name: "Abdominal infra",
    muscleGroup: "abdomen",
    loadType: "weight",
    createdAt: Date.now() + 4,
  },
  {
    id: "ex-esteira",
    name: "Esteira inclinada",
    muscleGroup: "cardio",
    loadType: "weight",
    createdAt: Date.now() + 4,
  },
];

const DEFAULT_WORKOUTS: Workout[] = [
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
    createdAt: Date.now(),
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
    createdAt: Date.now(),
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
    createdAt: Date.now(),
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

export function loadExercises(): Exercise[] {
  const existing = read<Exercise[] | null>(EXERCISES_KEY, null);
  if (existing && Array.isArray(existing)) {
    // migrate older records that predate muscleGroup
    return existing.map((e) => ({
      ...e,
      muscleGroup: e.muscleGroup ?? "outro",
    }));
  }
  write(EXERCISES_KEY, DEFAULT_EXERCISES);
  return DEFAULT_EXERCISES;
}

export function saveExercises(exercises: Exercise[]) {
  write(EXERCISES_KEY, exercises);
}

export function loadSets(): WorkoutSet[] {
  return read<WorkoutSet[]>(SETS_KEY, []);
}

export function saveSets(sets: WorkoutSet[]) {
  write(SETS_KEY, sets);
}

export function loadWorkouts(): Workout[] {
  const existing = read<Workout[] | null>(WORKOUTS_KEY, null);
  if (existing && Array.isArray(existing)) return existing;
  write(WORKOUTS_KEY, DEFAULT_WORKOUTS);
  return DEFAULT_WORKOUTS;
}

export function saveWorkouts(workouts: Workout[]) {
  write(WORKOUTS_KEY, workouts);
}

export function loadSessions(): WorkoutSession[] {
  return read<WorkoutSession[]>(SESSIONS_KEY, []);
}

export function saveSessions(sessions: WorkoutSession[]) {
  write(SESSIONS_KEY, sessions);
}
