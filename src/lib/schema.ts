import type {
  CardioProfile,
  CardioSession,
  Exercise,
  LoadType,
  MuscleGroup,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "../types";
import { LOAD_TYPES, MUSCLE_GROUPS } from "../types";

/**
 * Runtime validation for everything that comes from outside the app's own
 * memory: localStorage (may be stale or hand-edited) and imported backups.
 * Each normalizer returns a clean record, or null when it is unusable.
 */

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v : null;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const optStr = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s || undefined;
};

const loadType = (v: unknown): LoadType =>
  LOAD_TYPES.some((t) => t.value === v) ? (v as LoadType) : "weight";

const muscleGroup = (v: unknown): MuscleGroup =>
  MUSCLE_GROUPS.some((m) => m.value === v) ? (v as MuscleGroup) : "outro";

export function normalizeExercise(v: unknown): Exercise | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const name = str(v.name)?.trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    muscleGroup: muscleGroup(v.muscleGroup),
    loadType: loadType(v.loadType),
    ...(v.archived === true && { archived: true }),
    createdAt: num(v.createdAt) ?? Date.now(),
  };
}

export function normalizeSet(v: unknown): WorkoutSet | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const exerciseId = str(v.exerciseId);
  const load = num(v.load);
  if (!id || !exerciseId || load === null || load < 0) return null;
  const reps = num(v.reps);
  return {
    id,
    exerciseId,
    sessionId: str(v.sessionId) ?? undefined,
    loadType: loadType(v.loadType),
    load,
    reps: reps !== null && reps >= 1 ? Math.round(reps) : 1,
    note: optStr(v.note),
    createdAt: num(v.createdAt) ?? Date.now(),
  };
}

export function normalizeWorkout(v: unknown): Workout | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const name = str(v.name)?.trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    exerciseIds: Array.isArray(v.exerciseIds)
      ? v.exerciseIds.filter((x): x is string => typeof x === "string")
      : [],
    createdAt: num(v.createdAt) ?? Date.now(),
  };
}

export function normalizeSession(v: unknown): WorkoutSession | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const startedAt = num(v.startedAt);
  if (!id || startedAt === null) return null;
  return {
    id,
    workoutId: str(v.workoutId),
    name: str(v.name)?.trim() ?? "Treino livre",
    startedAt,
    finishedAt: num(v.finishedAt),
    note: optStr(v.note),
  };
}

export function normalizeCardioSession(v: unknown): CardioSession | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const speedKmh = num(v.speedKmh);
  const inclinePct = num(v.inclinePct);
  const minutes = num(v.minutes);
  const weightKg = num(v.weightKg);
  const kcal = num(v.kcal);
  const avgHr = num(v.avgHr);
  if (
    !id ||
    speedKmh === null ||
    inclinePct === null ||
    minutes === null ||
    weightKg === null ||
    kcal === null ||
    avgHr === null
  )
    return null;
  return {
    id,
    createdAt: num(v.createdAt) ?? Date.now(),
    speedKmh,
    inclinePct,
    minutes,
    weightKg,
    kcal,
    avgHr,
  };
}

export function normalizeCardioProfile(v: unknown): CardioProfile | null {
  if (!isRecord(v)) return null;
  const weightKg = num(v.weightKg);
  const age = num(v.age);
  if (!weightKg || !age) return null;
  return { weightKg, age };
}

export function normalizeList<T>(
  raw: unknown,
  normalize: (v: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map(normalize).filter((x): x is T => x !== null);
}

/* ---------- Backup file ---------- */

export interface BackupData {
  exercises: Exercise[];
  sets: WorkoutSet[];
  workouts: Workout[];
  sessions: WorkoutSession[];
  cardioSessions: CardioSession[];
  cardioProfile: CardioProfile | null;
}

interface BackupFile extends BackupData {
  app: "treino-log";
  version: 1;
  exportedAt: string;
}

export function buildBackup(data: BackupData): string {
  const file: BackupFile = {
    app: "treino-log",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(file, null, 2);
}

/** Parses and validates a backup; throws an Error with a user-facing message. */
export function parseBackup(text: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!isRecord(raw) || raw.app !== "treino-log") {
    throw new Error("Este arquivo não é um backup do FitLog.");
  }
  const exercises = normalizeList(raw.exercises, normalizeExercise);
  const sets = normalizeList(raw.sets, normalizeSet);
  const workouts = normalizeList(raw.workouts, normalizeWorkout);
  const sessions = normalizeList(raw.sessions, normalizeSession);
  if (!exercises || !sets || !workouts || !sessions) {
    throw new Error("O backup está incompleto ou corrompido.");
  }
  // older backups predate the cardio tab
  const cardioSessions =
    normalizeList(raw.cardioSessions, normalizeCardioSession) ?? [];
  const cardioProfile = normalizeCardioProfile(raw.cardioProfile);
  return {
    exercises,
    sets,
    workouts,
    sessions,
    cardioSessions,
    cardioProfile,
  };
}
