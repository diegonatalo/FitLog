import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Exercise,
  LoadType,
  MuscleGroup,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "../types";
import {
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

export function useWorkoutStore() {
  const [exercises, setExercises] = useState<Exercise[]>(() => loadExercises());
  const [sets, setSets] = useState<WorkoutSet[]>(() => loadSets());
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts());
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    loadSessions(),
  );

  useEffect(() => saveExercises(exercises), [exercises]);
  useEffect(() => saveSets(sets), [sets]);
  useEffect(() => saveWorkouts(workouts), [workouts]);
  useEffect(() => saveSessions(sessions), [sessions]);

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
    [],
  );

  const updateExercise = useCallback(
    (
      id: string,
      patch: Partial<Pick<Exercise, "name" | "muscleGroup" | "loadType">>,
    ) => {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...patch, name: (patch.name ?? e.name).trim() || e.name }
            : e,
        ),
      );
    },
    [],
  );

  const removeExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    setSets((prev) => prev.filter((s) => s.exerciseId !== id));
    setWorkouts((prev) =>
      prev.map((w) => ({
        ...w,
        exerciseIds: w.exerciseIds.filter((x) => x !== id),
      })),
    );
  }, []);

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
    [],
  );

  const removeSet = useCallback((id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /* ---------- Workouts ---------- */
  const addWorkout = useCallback((name: string, exerciseIds: string[]) => {
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
  }, []);

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
    [],
  );

  const removeWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  /* ---------- Sessions ---------- */
  const startSession = useCallback((workout: Workout | null) => {
    const session: WorkoutSession = {
      id: uid(),
      workoutId: workout?.id ?? null,
      name: workout?.name ?? "Treino livre",
      startedAt: Date.now(),
      finishedAt: null,
    };
    setSessions((prev) => [session, ...prev]);
    return session;
  }, []);

  const finishSession = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, finishedAt: Date.now() } : s)),
    );
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSets((prev) => prev.filter((s) => s.sessionId !== id));
  }, []);

  /* ---------- Derived ---------- */
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

  const activeSession = useMemo(
    () => sessions.find((s) => s.finishedAt === null) ?? null,
    [sessions],
  );

  const finishedSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.finishedAt !== null)
        .sort((a, b) => b.startedAt - a.startedAt),
    [sessions],
  );

  return {
    exercises,
    sets,
    workouts,
    sessions,
    setsByExercise,
    setsBySession,
    activeSession,
    finishedSessions,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    removeSet,
    addWorkout,
    updateWorkout,
    removeWorkout,
    startSession,
    finishSession,
    removeSession,
  };
}
