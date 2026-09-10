import { RESUME_TEMPLATES, type ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

interface Props {
  value: ResumeTemplate;
  onChange: (next: ResumeTemplate) => void;
  disabled?: boolean;
}

const TEMPLATE_META: Record<ResumeTemplate, { label: string; description: string }> = {
  classic: { label: "Classic", description: "Centred serif header, ruled sections." },
  modern: { label: "Modern", description: "Tinted sidebar for contact and skills." },
  minimal: { label: "Minimal", description: "Airy, understated, plenty of whitespace." },
  professional: { label: "Professional", description: "Wide main column, compact side column." },
  executive: { label: "Executive", description: "Large serif name, senior-level tone." },
  creative: { label: "Creative", description: "Accent colour and a timeline for roles." },
};

export function TemplateSelector({ value, onChange, disabled }: Props) {
  return (
    <SectionCard title="Template" description="Pick a layout — the preview updates instantly.">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {RESUME_TEMPLATES.map((template) => {
          const meta = TEMPLATE_META[template];
          const selected = value === template;
          return (
            <button
              key={template}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(template)}
              className={cn(
                "rounded-md border p-3 text-left transition-colors disabled:opacity-50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
