import type { LoadType, WorkoutSet } from "../types";
import { loadTypeMeta } from "../types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(ts: number) {
  return dateFmt.format(ts);
}

export function formatTime(ts: number) {
  return timeFmt.format(ts);
}

export function relativeDay(ts: number) {
  const now = new Date();
  const d = new Date(ts);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfSet = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  const diffDays = Math.round((startOfToday - startOfSet) / 86_400_000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDate(ts);
}

export function formatDuration(startMs: number, endMs: number) {
  const mins = Math.max(1, Math.round((endMs - startMs) / 60_000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

/** mm:ss, or h:mm:ss past one hour. */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

/** The number and its unit, split so layouts can style them separately. */
export function loadParts(loadType: LoadType, load: number) {
  const { unit } = loadTypeMeta(loadType);
  if (loadType === "bodyweight") {
    return load === 0
      ? { value: "0", unit: "corporal" }
      : { value: `+${load}`, unit };
  }
  return { value: String(load), unit };
}

export function formatLoad(loadType: LoadType, load: number) {
  const { value, unit } = loadParts(loadType, load);
  return `${value} ${unit}`;
}

/** "40 kg × 12", or just "20 min" for time-based sets. */
export function formatSet(set: Pick<WorkoutSet, "loadType" | "load" | "reps">) {
  const load = formatLoad(set.loadType, set.load);
  return loadTypeMeta(set.loadType).hasReps ? `${load} × ${set.reps}` : load;
}
