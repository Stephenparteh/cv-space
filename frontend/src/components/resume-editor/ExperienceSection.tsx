import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyExperience, type ExperienceItem } from "@/types/resume";
import { FormField } from "./FormField";
import { RepeatableItemHeader } from "./RepeatableItemHeader";
import { SectionCard } from "./SectionCard";

interface Props {
  items: ExperienceItem[];
  onChange: (next: ExperienceItem[]) => void;
  disabled?: boolean;
}

function Responsibilities({
  values,
  disabled,
  onChange,
}: {
  values: string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium">Responsibilities / achievements</p>
      {values.length === 0 ? (
        <p className="text-xs text-muted-foreground">Add bullet points describing what you did.</p>
      ) : (
        <ul className="space-y-2">
          {values.map((value, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <Input
                value={value}
                disabled={disabled}
                aria-label={`Responsibility ${i + 1}`}
                placeholder="e.g. Built and shipped the customer dashboard"
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label={`Remove responsibility ${i + 1}`}
                onClick={() => onChange(values.filter((_v, j) => j !== i))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...values, ""])}
      >
        <Plus /> Add responsibility
      </Button>
    </div>
  );
}

export function ExperienceSection({ items, onChange, disabled }: Props) {
  const update = (index: number, patch: Partial<ExperienceItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_item, i) => i !== index));
  const add = () => onChange([...items, emptyExperience()]);

  return (
    <SectionCard
      title="Work experience"
      description="List your roles, most recent first."
      action={
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
          <Plus /> Add experience
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No experience added yet.</p>
      ) : (
        <ol className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="rounded-md border border-border p-4">
              <RepeatableItemHeader
                title={item.jobTitle.trim() || `Experience ${index + 1}`}
                meta={item.company.trim() || undefined}
                onRemove={() => remove(index)}
                removeLabel={`Remove experience ${index + 1}`}
                disabled={disabled}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Job title">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.jobTitle}
                      disabled={disabled}
                      onChange={(e) => update(index, { jobTitle: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Company">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.company}
                      disabled={disabled}
                      onChange={(e) => update(index, { company: e.target.value })}
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
                <FormField label="Start date" hint="e.g. Jan 2021">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.startDate}
                      placeholder="Jan 2021"
                      disabled={disabled}
                      onChange={(e) => update(index, { startDate: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="End date" hint={item.current ? "Currently working here" : "e.g. Mar 2023"}>
                  {(id) => (
                    <Input
                      id={id}
                      value={item.current ? "" : item.endDate}
                      placeholder={item.current ? "Present" : "Mar 2023"}
                      disabled={disabled || item.current}
                      onChange={(e) => update(index, { endDate: e.target.value })}
                    />
                  )}
                </FormField>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={item.current}
                    disabled={disabled}
                    onChange={(e) =>
                      update(index, {
                        current: e.target.checked,
                        endDate: e.target.checked ? "" : item.endDate,
                      })
                    }
                  />
                  I currently work here
                </label>
              </div>

              <Responsibilities
                values={item.responsibilities}
                disabled={disabled}
                onChange={(responsibilities) => update(index, { responsibilities })}
              />
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
