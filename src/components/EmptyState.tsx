import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: IconCmp,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      <span className="mb-4 grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <IconCmp size={30} weight="duotone" />
      </span>
      <h3 className="text-base font-bold text-balance">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
