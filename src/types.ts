export type LoadType = "weight" | "plates";

export type MuscleGroup =
  | "peito"
  | "costas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "pernas"
  | "gluteos"
  | "abdomen"
  | "cardio"
  | "outro";

export interface MuscleGroupMeta {
  value: MuscleGroup;
  label: string;
}

export const MUSCLE_GROUPS: MuscleGroupMeta[] = [
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "pernas", label: "Pernas" },
  { value: "gluteos", label: "Glúteos" },
  { value: "abdomen", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
  { value: "outro", label: "Outro" },
];

export function muscleLabel(group: MuscleGroup): string {
  return MUSCLE_GROUPS.find((m) => m.value === group)?.label ?? "Outro";
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** default input mode for this exercise */
  loadType: LoadType;
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  /** set belongs to an active/finished session when present */
  sessionId?: string;
  loadType: LoadType;
  /** kg when loadType === "weight", number of plates when "plates" */
  load: number;
  reps: number;
  createdAt: number;
}

/** A reusable plan: a named group of exercises done on a given day */
export interface Workout {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: number;
}

/** A performed instance of a workout (or a free session) */
export interface WorkoutSession {
  id: string;
  workoutId: string | null;
  name: string;
  startedAt: number;
  /** null while the session is in progress */
  finishedAt: number | null;
}
