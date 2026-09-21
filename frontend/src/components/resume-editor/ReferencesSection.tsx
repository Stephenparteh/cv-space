import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyReference, type ReferenceItem } from "@/types/resume";
import { FormField } from "./FormField";
import { RepeatableItemHeader } from "./RepeatableItemHeader";
import { SectionCard } from "./SectionCard";

interface Props {
  items: ReferenceItem[];
  onChange: (next: ReferenceItem[]) => void;
  disabled?: boolean;
}

const FIELDS: { key: keyof ReferenceItem; label: string; type?: string; placeholder?: string }[] = [
  { key: "name", label: "Name" },
  { key: "position", label: "Position" },
  { key: "institution", label: "Institution / company" },
  { key: "location", label: "Location" },
  { key: "contact", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
];

export function ReferencesSection({ items, onChange, disabled }: Props) {
  const update = (index: number, patch: Partial<ReferenceItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_item, i) => i !== index));
  const add = () => onChange([...items, emptyReference()]);

  return (
    <SectionCard
      title="References"
      description="People who can speak to your work. Private — never shown on a public resume."
      action={
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
          <Plus /> Add reference
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No references added yet.</p>
      ) : (
        <ol className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="rounded-md border border-border p-4">
              <RepeatableItemHeader
                title={item.name.trim() || `Reference ${index + 1}`}
                meta={item.position.trim() || undefined}
                onRemove={() => remove(index)}
                removeLabel={`Remove reference ${index + 1}`}
                disabled={disabled}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <FormField key={field.key} label={field.label}>
                    {(id) => (
                      <Input
                        id={id}
                        type={field.type ?? "text"}
                        value={item[field.key]}
                        disabled={disabled}
                        onChange={(e) => update(index, { [field.key]: e.target.value })}
                      />
                    )}
                  </FormField>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
