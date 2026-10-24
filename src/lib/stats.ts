import type { LoadType, WorkoutSet } from "../types";

/** Heaviest set; ties go to the one with more reps. */
export function bestSet(sets: WorkoutSet[], loadType: LoadType) {
  let best: WorkoutSet | null = null;
  for (const s of sets) {
    if (s.loadType !== loadType) continue;
    if (
      !best ||
      s.load > best.load ||
      (s.load === best.load && s.reps > best.reps)
    ) {
      best = s;
    }
  }
  return best;
}

/** Epley formula, rounded to the nearest 0.5. */
export function estimateOneRepMax(load: number, reps: number) {
  const raw = reps <= 1 ? load : load * (1 + reps / 30);
  return Math.round(raw * 2) / 2;
}

/**
 * Sets that beat every earlier set of the same load type. The very first set
 * of an exercise is not a record, there is nothing to beat yet.
 */
export function recordIds(sets: WorkoutSet[]) {
  const chronological = [...sets].sort((a, b) => a.createdAt - b.createdAt);
  const maxByType = new Map<LoadType, number>();
  const ids = new Set<string>();
  for (const s of chronological) {
    const max = maxByType.get(s.loadType);
    if (max !== undefined && s.load > max) ids.add(s.id);
    if (max === undefined || s.load > max) maxByType.set(s.loadType, s.load);
  }
  return ids;
}

export function isNewRecord(
  previous: WorkoutSet[],
  loadType: LoadType,
  load: number,
) {
  let max: number | null = null;
  for (const s of previous) {
    if (s.loadType === loadType && (max === null || s.load > max)) max = s.load;
  }
  return max !== null && load > max;
}

export interface DailyBest {
  day: number;
  load: number;
}

/** Best load per calendar day, oldest first. */
export function dailyBest(sets: WorkoutSet[], loadType: LoadType) {
  const byDay = new Map<number, number>();
  for (const s of sets) {
    if (s.loadType !== loadType) continue;
    const d = new Date(s.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    byDay.set(day, Math.max(byDay.get(day) ?? 0, s.load));
  }
  return [...byDay.entries()]
    .map(([day, load]): DailyBest => ({ day, load }))
    .sort((a, b) => a.day - b.day);
}
