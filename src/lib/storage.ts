import type {
  CardioProfile,
  CardioSession,
  Exercise,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "../types";
import { DEFAULT_EXERCISES, DEFAULT_WORKOUTS } from "./defaults";
import {
  normalizeCardioProfile,
  normalizeCardioSession,
  normalizeExercise,
  normalizeList,
  normalizeSession,
  normalizeSet,
  normalizeWorkout,
} from "./schema";

export const STORAGE_KEYS = {
  exercises: "treino-log:exercises:v1",
  sets: "treino-log:sets:v1",
  workouts: "treino-log:workouts:v1",
  sessions: "treino-log:sessions:v1",
  cardioSessions: "treino-log:cardio-sessions:v1",
  cardioProfile: "treino-log:cardio-profile:v1",
} as const;

export const THEME_KEY = "treino-log:theme:v1";
const SCHEMA_KEY = "treino-log:schema";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

/** Reads a list, dropping invalid entries; null when absent or not a list. */
function readList<T>(
  key: string,
  normalize: (v: unknown) => T | null,
): T[] | null {
  return normalizeList(readJson(key), normalize);
}

/* ---------- Migrations ---------- */

/** Each entry upgrades the stored data to that schema version. */
const MIGRATIONS: Record<number, () => void> = {
  // 2: fixes the typo in a default exercise name
  2: () => {
    const list = readList(STORAGE_KEYS.exercises, normalizeExercise);
    if (!list) return;
    write(
      STORAGE_KEYS.exercises,
      list.map((e) =>
        e.id === "ex-triceps-frances" && e.name === "Tríceps frânces"
          ? { ...e, name: "Tríceps francês" }
          : e,
      ),
    );
  },
  // 3: the treadmill calculator replaces the default "Esteira inclinada"
  3: () => {
    const list = readList(STORAGE_KEYS.exercises, normalizeExercise);
    if (!list) return;
    write(
      STORAGE_KEYS.exercises,
      list.map((e) => (e.id === "ex-esteira" ? { ...e, archived: true } : e)),
    );
  },
};

const CURRENT_SCHEMA = 3;
let migrated = false;

function ensureMigrated() {
  if (migrated) return;
  migrated = true;
  const stored = Number(readJson(SCHEMA_KEY)) || 1;
  for (let v = stored + 1; v <= CURRENT_SCHEMA; v++) MIGRATIONS[v]?.();
  if (stored < CURRENT_SCHEMA) write(SCHEMA_KEY, CURRENT_SCHEMA);
}

/* ---------- Loaders / savers ---------- */

export function loadExercises(): Exercise[] {
  ensureMigrated();
  const list = readList(STORAGE_KEYS.exercises, normalizeExercise);
  if (list) return list;
  write(STORAGE_KEYS.exercises, DEFAULT_EXERCISES);
  return DEFAULT_EXERCISES;
}

export function saveExercises(exercises: Exercise[]) {
  write(STORAGE_KEYS.exercises, exercises);
}

export function loadSets(): WorkoutSet[] {
  ensureMigrated();
  return readList(STORAGE_KEYS.sets, normalizeSet) ?? [];
}

export function saveSets(sets: WorkoutSet[]) {
  write(STORAGE_KEYS.sets, sets);
}

export function loadWorkouts(): Workout[] {
  ensureMigrated();
  const list = readList(STORAGE_KEYS.workouts, normalizeWorkout);
  if (list) return list;
  write(STORAGE_KEYS.workouts, DEFAULT_WORKOUTS);
  return DEFAULT_WORKOUTS;
}

export function saveWorkouts(workouts: Workout[]) {
  write(STORAGE_KEYS.workouts, workouts);
}

export function loadSessions(): WorkoutSession[] {
  ensureMigrated();
  return readList(STORAGE_KEYS.sessions, normalizeSession) ?? [];
}

export function saveSessions(sessions: WorkoutSession[]) {
  write(STORAGE_KEYS.sessions, sessions);
}

export function loadCardioSessions(): CardioSession[] {
  ensureMigrated();
  return readList(STORAGE_KEYS.cardioSessions, normalizeCardioSession) ?? [];
}

export function saveCardioSessions(sessions: CardioSession[]) {
  write(STORAGE_KEYS.cardioSessions, sessions);
}

export function loadCardioProfile(): CardioProfile | null {
  ensureMigrated();
  return normalizeCardioProfile(readJson(STORAGE_KEYS.cardioProfile));
}

export function saveCardioProfile(profile: CardioProfile | null) {
  write(STORAGE_KEYS.cardioProfile, profile);
}
