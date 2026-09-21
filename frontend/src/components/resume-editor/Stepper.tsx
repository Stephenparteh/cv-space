import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  current: number;
  furthest: number;
  onStep: (index: number) => void;
}

type StepState = "current" | "done" | "upcoming";

const stateOf = (i: number, current: number, furthest: number): StepState =>
  i === current ? "current" : i < furthest ? "done" : "upcoming";

/**
 * Résumé wizard step indicator.
 *
 * Below `sm` there isn't room for eight 44px touch targets side by side, so
 * mobile shows the progress bar + current step name, with the full list
 * available on demand (each row still a full 44px target) rather than eight
 * cramped circles. From `sm` up, all eight steps show as a compact row —
 * still every circle at the 44px minimum.
 */
export function Stepper({ steps, current, furthest, onStep }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(((current + 1) / steps.length) * 100);

  const goTo = (i: number) => {
    onStep(i);
    setExpanded(false);
  };

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
          className="h-full rounded-full bg-accent transition-[width] duration-progress ease-standard"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Step {current + 1} of {steps.length} ·{" "}
          <span className="font-medium text-foreground">{steps[current]}</span>
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent sm:hidden"
        >
          All steps
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-micro", expanded && "rotate-180")} />
        </button>
      </div>

      {/* Mobile: full step list on demand, one full-width 44px row each. */}
      {expanded && (
        <ol className="grid gap-1.5 rounded-md border border-border bg-card p-1.5 sm:hidden">
          {steps.map((label, i) => {
            const state = stateOf(i, current, furthest);
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors duration-micro",
                    state === "current" && "bg-accent text-accent-foreground",
                    state !== "current" && "text-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                      state === "current" && "bg-accent-foreground/20",
                      state === "done" && "bg-accent/15 text-accent",
                      state === "upcoming" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* sm and up: compact row, every circle a full 44px target. */}
      <ol className="hidden flex-wrap gap-2 sm:flex">
        {steps.map((label, i) => {
          const state = stateOf(i, current, furthest);
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={state === "current" ? "step" : undefined}
                aria-label={`Step ${i + 1}, ${label}${state === "done" ? " (completed)" : state === "current" ? " (current)" : ""}`}
                title={`${i + 1}. ${label}`}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-micro",
                  state === "current" && "border-accent bg-accent text-accent-foreground",
                  state === "done" && "border-accent/40 bg-accent/10 text-accent",
                  state === "upcoming" && "border-border text-muted-foreground hover:border-foreground/40",
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
