import { BarbellIcon, StackIcon } from "@phosphor-icons/react";
import type { LoadType } from "../types";
import { cn } from "../lib/format";

interface LoadTypeToggleProps {
  value: LoadType;
  onChange: (value: LoadType) => void;
}

const OPTIONS: { value: LoadType; label: string; icon: typeof BarbellIcon }[] = [
  { value: "weight", label: "Peso (kg)", icon: BarbellIcon },
  { value: "plates", label: "Placas", icon: StackIcon },
];

export function LoadTypeToggle({ value, onChange }: LoadTypeToggleProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted"
      role="tablist"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
