import type { MuscleGroup } from "../types";
import { muscleLabel } from "../types";

interface MuscleBadgeProps {
  group: MuscleGroup;
  size?: "sm" | "md";
}

export function MuscleBadge({ group, size = "sm" }: MuscleBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border border-border bg-muted font-semibold uppercase tracking-wide text-muted-foreground " +
        (size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs")
      }
    >
      {muscleLabel(group)}
    </span>
  );
}
