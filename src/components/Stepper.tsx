import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useId } from "react";

interface StepperProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step: number;
  min?: number;
  placeholder?: string;
}

export function Stepper({
  label,
  value,
  onChange,
  step,
  min = 0,
  placeholder = "0",
}: StepperProps) {
  const id = useId();

  const bump = (delta: number) => {
    const n = Number.parseFloat(value) || 0;
    onChange(String(Math.max(min, +(n + delta).toFixed(2))));
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-center overflow-hidden rounded-xl border border-input bg-background">
        <button
          type="button"
          aria-label={`Diminuir ${label}`}
          onClick={() => bump(-step)}
          className="grid size-11 shrink-0 place-items-center text-muted-foreground hover:bg-muted active:bg-muted"
        >
          <MinusIcon size={18} weight="bold" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent py-2.5 text-center font-mono text-xl font-bold outline-none"
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => bump(step)}
          className="grid size-11 shrink-0 place-items-center text-muted-foreground hover:bg-muted active:bg-muted"
        >
          <PlusIcon size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
