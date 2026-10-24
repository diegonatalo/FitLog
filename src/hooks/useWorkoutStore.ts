import { useCallback, useMemo } from "react";
import type {
  Exercise,
  LoadType,
  MuscleGroup,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "../types";
import type { BackupData } from "../lib/schema";
import {
  STORAGE_KEYS,
  loadExercises,
  loadSessions,
  loadSets,
  loadWorkouts,
  saveExercises,
  saveSessions,
  saveSets,
  saveWorkouts,
  uid,
} from "../lib/storage";
import { usePersistedState } from "./usePersistedState";

export type Store = ReturnType<typeof useWorkoutStore>;

export function useWorkoutStore() {
  const [exercises, setExercises] = usePersistedState(
    STORAGE_KEYS.exercises,
    loadExercises,
    saveExercises,
  );
  const [sets, setSets] = usePersistedState(
    STORAGE_KEYS.sets,
    loadSets,
    saveSets,
  );
  const [workouts, setWorkouts] = usePersistedState(
    STORAGE_KEYS.workouts,
    loadWorkouts,
    saveWorkouts,
  );
  const [sessions, setSessions] = usePersistedState(
    STORAGE_KEYS.sessions,
    loadSessions,
    saveSessions,
  );

  /* ---------- Exercises ---------- */
  const addExercise = useCallback(
    (name: string, muscleGroup: MuscleGroup, loadType: LoadType) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const exercise: Exercise = {
        id: uid(),
        name: trimmed,
        muscleGroup,
        loadType,
        createdAt: Date.now(),
      };
      setExercises((prev) => [...prev, exercise]);
      return exercise;
    },
    [setExercises],
  );

  const updateExercise = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Exercise, "name" | "muscleGroup" | "loadType" | "archived">
      >,
    ) => {
      setExercises((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const next = { ...e, ...patch };
          next.name = next.name.trim() || e.name;
          if (!next.archived) delete next.archived;
          return next;
        }),
      );
    },
    [setExercises],
  );

  const archiveExercise = useCallback(
    (id: string) => updateExercise(id, { archived: true }),
    [updateExercise],
  );

  const restoreExercise = useCallback(
    (id: string) => updateExercise(id, { archived: false }),
    [updateExercise],
  );

  /** Permanent: also drops the exercise's sets and its place in workouts. */
  const removeExercise = useCallback(
    (id: string) => {
      setExercises((prev) => prev.filter((e) => e.id !== id));
      setSets((prev) => prev.filter((s) => s.exerciseId !== id));
      setWorkouts((prev) =>
        prev.map((w) => ({
          ...w,
          exerciseIds: w.exerciseIds.filter((x) => x !== id),
        })),
      );
    },
    [setExercises, setSets, setWorkouts],
  );

  /* ---------- Sets ---------- */
  const addSet = useCallback(
    (
      exerciseId: string,
      loadType: LoadType,
      load: number,
      reps: number,
      sessionId?: string,
    ) => {
      const set: WorkoutSet = {
        id: uid(),
        exerciseId,
        sessionId,
        loadType,
        load,
        reps,
        createdAt: Date.now(),
      };
      setSets((prev) => [set, ...prev]);
      return set;
    },
    [setSets],
  );

  const updateSet = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSet, "load" | "reps" | "note">>) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...patch, note: patch.note?.trim() || undefined }
            : s,
        ),
      );
    },
    [setSets],
  );

  const removeSet = useCallback(
    (id: string) => setSets((prev) => prev.filter((s) => s.id !== id)),
    [setSets],
  );

  /* ---------- Workouts ---------- */
  const addWorkout = useCallback(
    (name: string, exerciseIds: string[]) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const workout: Workout = {
        id: uid(),
        name: trimmed,
        exerciseIds,
        createdAt: Date.now(),
      };
      setWorkouts((prev) => [workout, ...prev]);
      return workout;
    },
    [setWorkouts],
  );

  const updateWorkout = useCallback(
    (id: string, patch: Partial<Pick<Workout, "name" | "exerciseIds">>) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, ...patch, name: (patch.name ?? w.name).trim() || w.name }
            : w,
        ),
      );
    },
    [setWorkouts],
  );

  const removeWorkout = useCallback(
    (id: string) => setWorkouts((prev) => prev.filter((w) => w.id !== id)),
    [setWorkouts],
  );

  /* ---------- Sessions ---------- */
  const activeSession = useMemo(
    () => sessions.find((s) => s.finishedAt === null) ?? null,
    [sessions],
  );

  /** Only one session can run at a time: starting again resumes the active one. */
  const startSession = useCallback(
    (workout: Workout | null) => {
      if (activeSession) return activeSession;
      const session: WorkoutSession = {
        id: uid(),
        workoutId: workout?.id ?? null,
        name: workout?.name ?? "Treino livre",
        startedAt: Date.now(),
        finishedAt: null,
      };
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [activeSession, setSessions],
  );

  const finishSession = useCallback(
    (id: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, finishedAt: Date.now() } : s)),
      );
    },
    [setSessions],
  );

  const updateSession = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSession, "note">>) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [setSessions],
  );

  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSets((prev) => prev.filter((s) => s.sessionId !== id));
    },
    [setSessions, setSets],
  );

  /* ---------- Bulk ---------- */
  const replaceAll = useCallback(
    (data: BackupData) => {
      setExercises(data.exercises);
      setSets(data.sets);
      setWorkouts(data.workouts);
      setSessions(data.sessions);
    },
    [setExercises, setSets, setWorkouts, setSessions],
  );

  const clearAll = useCallback(
    () =>
      replaceAll({ exercises: [], sets: [], workouts: [], sessions: [] }),
    [replaceAll],
  );

  /* ---------- Derived ---------- */
  const activeExercises = useMemo(
    () => exercises.filter((e) => !e.archived),
    [exercises],
  );

  const setsByExercise = useMemo(() => {
    const map = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => b.createdAt - a.createdAt);
    return map;
  }, [sets]);

  const setsBySession = useMemo(() => {
    const map = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      if (!s.sessionId) continue;
      const arr = map.get(s.sessionId) ?? [];
      arr.push(s);
      map.set(s.sessionId, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.createdAt - b.createdAt);
    return map;
  }, [sets]);

  const finishedSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.finishedAt !== null)
        .sort((a, b) => b.startedAt - a.startedAt),
    [sessions],
  );

  return {
    exercises,
    activeExercises,
    sets,
    workouts,
    sessions,
    setsByExercise,
    setsBySession,
    activeSession,
    finishedSessions,
    addExercise,
    updateExercise,
    archiveExercise,
    restoreExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    addWorkout,
    updateWorkout,
    removeWorkout,
    startSession,
    finishSession,
    updateSession,
    removeSession,
    replaceAll,
    clearAll,
  };
}
