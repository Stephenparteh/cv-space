import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  current: number;
  furthest: number;
  onStep: (index: number) => void;
}

/** Compact, responsive step indicator for the resume wizard. */
export function Stepper({ steps, current, furthest, onStep }: Props) {
  const pct = Math.round(((current + 1) / steps.length) * 100);

  return (
    <nav aria-label="Resume editor steps" className="space-y-3">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Step {current + 1} of {steps.length} ·{" "}
        <span className="font-medium text-foreground">{steps[current]}</span>
      </p>

      <ol className="flex flex-wrap gap-1.5">
        {steps.map((label, i) => {
          const state = i === current ? "current" : i < furthest ? "done" : "upcoming";
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Step ${i + 1}, ${label}${state === "done" ? " (completed)" : state === "current" ? " (current)" : ""}`}
                title={`${i + 1}. ${label}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  state === "current" && "border-primary bg-primary text-primary-foreground",
                  state === "done" && "border-primary/40 bg-primary/10 text-primary",
                  state === "upcoming" && "border-border text-muted-foreground hover:border-foreground/40",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
