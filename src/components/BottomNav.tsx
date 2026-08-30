import {
  BarbellIcon,
  ClockCounterClockwiseIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import { NavLink } from "react-router";
import { paths } from "../lib/paths";
import { cn } from "../lib/format";

const ITEMS: { to: string; label: string; icon: typeof HouseIcon }[] = [
  { to: paths.home, label: "Início", icon: HouseIcon },
  { to: paths.library, label: "Biblioteca", icon: BarbellIcon },
  { to: paths.history, label: "Histórico", icon: ClockCounterClockwiseIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} weight={isActive ? "fill" : "regular"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
