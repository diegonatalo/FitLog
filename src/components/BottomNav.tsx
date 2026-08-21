import {
  BarbellIcon,
  ClockCounterClockwiseIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import type { Tab } from "../hooks/useNav";
import { cn } from "../lib/format";

interface BottomNavProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

const ITEMS: { tab: Tab; label: string; icon: typeof HouseIcon }[] = [
  { tab: "home", label: "Início", icon: HouseIcon },
  { tab: "library", label: "Biblioteca", icon: BarbellIcon },
  { tab: "history", label: "Histórico", icon: ClockCounterClockwiseIcon },
];

export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ tab, label, icon: Icon }) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => onSelect(tab)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={22} weight={isActive ? "fill" : "regular"} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
