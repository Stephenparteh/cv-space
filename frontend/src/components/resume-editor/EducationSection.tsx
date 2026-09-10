import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyEducation, type EducationItem } from "@/types/resume";
import { FormField } from "./FormField";
import { SectionCard } from "./SectionCard";

interface Props {
  items: EducationItem[];
  onChange: (next: EducationItem[]) => void;
  disabled?: boolean;
}

export function EducationSection({ items, onChange, disabled }: Props) {
  const update = (index: number, patch: Partial<EducationItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_item, i) => i !== index));
  const add = () => onChange([...items, emptyEducation()]);

  return (
    <SectionCard
      title="Education"
      description="Degrees, courses and qualifications."
      action={
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
          <Plus /> Add education
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No education added yet.</p>
      ) : (
        <ol className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="rounded-md border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Education {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  aria-label={`Remove education ${index + 1}`}
                >
                  <Trash2 /> Remove
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Institution">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.institution}
                      disabled={disabled}
                      onChange={(e) => update(index, { institution: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Degree">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.degree}
                      disabled={disabled}
                      onChange={(e) => update(index, { degree: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Field of study">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.fieldOfStudy}
                      disabled={disabled}
                      onChange={(e) => update(index, { fieldOfStudy: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Location">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.location}
                      disabled={disabled}
                      onChange={(e) => update(index, { location: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Start date" hint="e.g. 2016">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.startDate}
                      placeholder="2016"
                      disabled={disabled}
                      onChange={(e) => update(index, { startDate: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="End date" hint="e.g. 2020">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.endDate}
                      placeholder="2020"
                      disabled={disabled}
                      onChange={(e) => update(index, { endDate: e.target.value })}
                    />
                  )}
                </FormField>
              </div>

              <FormField label="Description" className="mt-4">
                {(id) => (
                  <Textarea
                    id={id}
                    value={item.description}
                    rows={3}
                    disabled={disabled}
                    placeholder="Notable coursework, achievements or activities."
                    onChange={(e) => update(index, { description: e.target.value })}
                  />
                )}
              </FormField>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
