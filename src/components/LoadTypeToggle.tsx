import {
  BarbellIcon,
  PersonSimpleIcon,
  StackIcon,
  TimerIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { LoadType } from "../types";
import { LOAD_TYPES } from "../types";
import { cn } from "../lib/format";

interface LoadTypeToggleProps {
  value: LoadType;
  onChange: (value: LoadType) => void;
}

const ICONS: Record<LoadType, Icon> = {
  weight: BarbellIcon,
  plates: StackIcon,
  bodyweight: PersonSimpleIcon,
  time: TimerIcon,
};

export function LoadTypeToggle({ value, onChange }: LoadTypeToggleProps) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4"
      role="tablist"
    >
      {LOAD_TYPES.map((opt) => {
        const active = opt.value === value;
        const IconCmp = ICONS[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <IconCmp size={18} weight={active ? "fill" : "regular"} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
