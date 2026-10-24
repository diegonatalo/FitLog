export type LoadType = "weight" | "plates" | "bodyweight" | "time";

export interface LoadTypeMeta {
  value: LoadType;
  /** short label used in the toggle */
  label: string;
  /** label of the load input */
  loadLabel: string;
  /** unit shown next to a stored load */
  unit: string;
  /** increment of the +/- stepper */
  step: number;
  /** whether a load of 0 is a valid entry (e.g. bodyweight only) */
  allowZero: boolean;
  /** time-based exercises have no repetitions */
  hasReps: boolean;
}

export const LOAD_TYPES: LoadTypeMeta[] = [
  {
    value: "weight",
    label: "Peso",
    loadLabel: "Peso (kg)",
    unit: "kg",
    step: 2.5,
    allowZero: false,
    hasReps: true,
  },
  {
    value: "plates",
    label: "Placas",
    loadLabel: "Placas",
    unit: "placas",
    step: 1,
    allowZero: false,
    hasReps: true,
  },
  {
    value: "bodyweight",
    label: "Corporal",
    loadLabel: "Carga extra (kg)",
    unit: "kg",
    step: 2.5,
    allowZero: true,
    hasReps: true,
  },
  {
    value: "time",
    label: "Tempo",
    loadLabel: "Minutos",
    unit: "min",
    step: 1,
    allowZero: false,
    hasReps: false,
  },
];

export function loadTypeMeta(value: LoadType): LoadTypeMeta {
  return LOAD_TYPES.find((t) => t.value === value) ?? LOAD_TYPES[0];
}

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
  /** archived exercises keep their history but disappear from the lists */
  archived?: boolean;
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  /** set belongs to an active/finished session when present */
  sessionId?: string;
  loadType: LoadType;
  /** see `loadTypeMeta(loadType).unit` for the unit */
  load: number;
  /** always 1 for time-based exercises */
  reps: number;
  note?: string;
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
  note?: string;
}
