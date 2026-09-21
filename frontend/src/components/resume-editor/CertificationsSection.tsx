import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyCertification, type CertificationItem } from "@/types/resume";
import { FormField } from "./FormField";
import { RepeatableItemHeader } from "./RepeatableItemHeader";
import { SectionCard } from "./SectionCard";

interface Props {
  items: CertificationItem[];
  onChange: (next: CertificationItem[]) => void;
  disabled?: boolean;
}

export function CertificationsSection({ items, onChange, disabled }: Props) {
  const update = (index: number, patch: Partial<CertificationItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_item, i) => i !== index));
  const add = () => onChange([...items, emptyCertification()]);

  return (
    <SectionCard
      title="Certifications & training"
      description="Professional certifications, short courses, bootcamps and workshops."
      action={
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
          <Plus /> Add certification / training
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No certifications or training added yet.</p>
      ) : (
        <ol className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="rounded-md border border-border p-4">
              <RepeatableItemHeader
                title={item.name.trim() || `Certification ${index + 1}`}
                meta={item.institution.trim() || undefined}
                onRemove={() => remove(index)}
                removeLabel={`Remove certification ${index + 1}`}
                disabled={disabled}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Name / title">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.name}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      disabled={disabled}
                      onChange={(e) => update(index, { name: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="Issuing institution">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.institution}
                      disabled={disabled}
                      onChange={(e) => update(index, { institution: e.target.value })}
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
                <FormField label="Start date" hint="e.g. 2023">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.startDate}
                      placeholder="2023"
                      disabled={disabled}
                      onChange={(e) => update(index, { startDate: e.target.value })}
                    />
                  )}
                </FormField>
                <FormField label="End date" hint="e.g. 2023">
                  {(id) => (
                    <Input
                      id={id}
                      value={item.endDate}
                      placeholder="2023"
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
                    rows={2}
                    disabled={disabled}
                    placeholder="Optional — what the certification covered."
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
