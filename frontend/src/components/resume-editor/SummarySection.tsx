import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./FormField";
import { SectionCard } from "./SectionCard";

interface Props {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export function SummarySection({ value, onChange, disabled }: Props) {
  return (
    <SectionCard
      title="Professional summary"
      description="A short paragraph describing your experience and strengths."
    >
      <FormField label="Summary">
        {(id) => (
          <Textarea
            id={id}
            value={value}
            rows={5}
            disabled={disabled}
            placeholder="Experienced software engineer with a focus on…"
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </FormField>
    </SectionCard>
  );
}
