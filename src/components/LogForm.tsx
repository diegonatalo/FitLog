import { useState } from "react";
import { Check, FloppyDisk, Minus, Plus } from "@phosphor-icons/react";
import type { LoadType } from "../types";
import { LoadTypeToggle } from "./LoadTypeToggle";
import { cn } from "../lib/format";

interface LogFormProps {
  defaultLoadType: LoadType;
  onSave: (loadType: LoadType, load: number, reps: number) => void;
  justSaved: boolean;
}

export function LogForm({ defaultLoadType, onSave, justSaved }: LogFormProps) {
  const [loadType, setLoadType] = useState<LoadType>(defaultLoadType);
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("");

  const loadNum = Number.parseFloat(load);
  const repsNum = Number.parseInt(reps, 10);
  const valid =
    Number.isFinite(loadNum) &&
    loadNum > 0 &&
    Number.isInteger(repsNum) &&
    repsNum > 0;

  const submit = () => {
    if (!valid) return;
    onSave(loadType, loadNum, repsNum);
    setLoad("");
    setReps("");
  };

  const step = (
    setter: (v: string) => void,
    current: string,
    delta: number,
    min = 0,
  ) => {
    const n = Number.parseFloat(current) || 0;
    const next = Math.max(min, +(n + delta).toFixed(2));
    setter(String(next));
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Registrar série
      </h2>

      <LoadTypeToggle value={loadType} onChange={setLoadType} />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stepper
          label={loadType === "weight" ? "Peso (kg)" : "Placas"}
          value={load}
          onChange={setLoad}
          onStep={(d) => step(setLoad, load, d)}
          placeholder="0"
          stepAmount={loadType === "weight" ? 2.5 : 1}
        />
        <Stepper
          label="Repetições"
          value={reps}
          onChange={(v) => setReps(v.replace(/[^\d]/g, ""))}
          onStep={(d) => step(setReps, reps, d)}
          placeholder="0"
          stepAmount={1}
        />
      </div>

      <button
        onClick={submit}
        disabled={!valid}
        className={cn(
          "mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
          justSaved
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {justSaved ? (
          <>
            <Check size={20} weight="bold" /> Salvo!
          </>
        ) : (
          <>
            <FloppyDisk size={20} weight="bold" /> Salvar
          </>
        )}
      </button>
    </section>
  );
}

interface StepperProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onStep: (delta: number) => void;
  placeholder: string;
  stepAmount: number;
}

function Stepper({
  label,
  value,
  onChange,
  onStep,
  placeholder,
  stepAmount,
}: StepperProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-input bg-background overflow-hidden">
        <button
          type="button"
          aria-label={`Diminuir ${label}`}
          onClick={() => onStep(-stepAmount)}
          className="size-11 shrink-0 grid place-items-center text-muted-foreground hover:bg-muted active:bg-muted"
        >
          <Minus size={18} weight="bold" />
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 text-center font-mono text-xl font-bold bg-transparent outline-none py-2.5"
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(stepAmount)}
          className="size-11 shrink-0 grid place-items-center text-muted-foreground hover:bg-muted active:bg-muted"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
