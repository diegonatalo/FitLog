import type { ReactNode } from "react";
import {
  BarbellIcon,
  CaretLeftIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  showBack: boolean;
  onBack: () => void;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function Header({
  theme,
  onToggleTheme,
  showBack,
  onBack,
  title,
  subtitle,
  rightSlot,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
        {showBack ? (
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="-ml-2 grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
        ) : (
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Barbell size={22} weight="fill" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs leading-none text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {rightSlot}

        <button
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
          }
          className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          {theme === "dark" ? (
            <Sun size={20} weight="bold" />
          ) : (
            <Moon size={20} weight="bold" />
          )}
        </button>
      </div>
    </header>
  );
}
