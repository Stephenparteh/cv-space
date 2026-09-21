import { RESUME_TEMPLATES, type ResumeEditableFields, type ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";
import { TemplateThumbnail } from "@/components/resume-preview/TemplateThumbnail";
import { SectionCard } from "./SectionCard";

interface Props {
  value: ResumeTemplate;
  data: ResumeEditableFields;
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

/** Each option renders your actual content in that template — not a text description. */
export function TemplateSelector({ value, data, onChange, disabled }: Props) {
  return (
    <SectionCard title="Template" description="Pick a layout — shown with your own content, exactly as it will look.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {RESUME_TEMPLATES.map((template) => {
          const meta = TEMPLATE_META[template];
          const selected = value === template;
          return (
            <button
              key={template}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${meta.label} template — ${meta.description}${selected ? " (selected)" : ""}`}
              onClick={() => onChange(template)}
              className="flex flex-col gap-1.5 rounded-md text-left transition-opacity duration-micro disabled:opacity-50"
            >
              <TemplateThumbnail data={{ ...data, template }} selected={selected} interactive />
              <p className={cn("truncate px-0.5 text-sm font-medium", selected ? "text-accent" : "text-foreground")}>
                {meta.label}
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
