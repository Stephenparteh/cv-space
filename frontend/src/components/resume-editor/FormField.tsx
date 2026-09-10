import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  /** Render prop receives the generated id to wire onto the control. */
  children: (id: string) => ReactNode;
  className?: string;
  hint?: string;
}

/** Label + control pair with a stable generated id for accessibility. */
export function FormField({ label, children, className, hint }: FormFieldProps) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
