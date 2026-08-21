import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import type { Exercise, LoadType, MuscleGroup } from "../types";
import { MUSCLE_GROUPS } from "../types";
import { LoadTypeToggle } from "./LoadTypeToggle";
import { cn } from "../lib/format";

interface ExerciseFormProps {
  /** when provided, the form edits this exercise */
  exercise?: Exercise;
  onClose: () => void;
  onSubmit: (
    name: string,
    muscleGroup: MuscleGroup,
    loadType: LoadType,
  ) => void;
}

export function ExerciseForm({
  exercise,
  onClose,
  onSubmit,
}: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(
    exercise?.muscleGroup ?? "peito",
  );
  const [loadType, setLoadType] = useState<LoadType>(
    exercise?.loadType ?? "weight",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name, muscleGroup, loadType);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={exercise ? "Editar exercício" : "Novo exercício"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:border"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {exercise ? "Editar exercício" : "Novo exercício"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <label className="mb-1.5 block text-sm font-medium" htmlFor="ex-name">
          Nome
        </label>
        <input
          id="ex-name"
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            )
              submit();
          }}
          placeholder="Ex: Leg press"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />

        <label className="mb-2 mt-4 block text-sm font-medium">
          Grupo muscular
        </label>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((m) => {
            const active = m.value === muscleGroup;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMuscleGroup(m.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <label className="mb-1.5 mt-4 block text-sm font-medium">
          Tipo de carga
        </label>
        <LoadTypeToggle value={loadType} onChange={setLoadType} />

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-5 w-full rounded-xl bg-accent py-3.5 font-bold text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {exercise ? "Salvar alterações" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
