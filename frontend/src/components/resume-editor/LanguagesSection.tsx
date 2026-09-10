import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LANGUAGE_LEVELS, emptyLanguage, type LanguageItem } from "@/types/resume";
import { FormField } from "./FormField";
import { SectionCard } from "./SectionCard";

interface Props {
  items: LanguageItem[];
  onChange: (next: LanguageItem[]) => void;
  disabled?: boolean;
}

export function LanguagesSection({ items, onChange, disabled }: Props) {
  const update = (index: number, patch: Partial<LanguageItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_item, i) => i !== index));
  const add = () => onChange([...items, emptyLanguage()]);

  return (
    <SectionCard
      title="Languages"
      description="Languages you speak and your level."
      action={
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
          <Plus /> Add language
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No languages added yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <FormField label="Language">
                {(id) => (
                  <Input
                    id={id}
                    value={item.language}
                    placeholder="e.g. English"
                    disabled={disabled}
                    onChange={(e) => update(index, { language: e.target.value })}
                  />
                )}
              </FormField>
              <FormField label="Proficiency">
                {(id) => (
                  <select
                    id={id}
                    value={item.proficiency}
                    disabled={disabled}
                    onChange={(e) => update(index, { proficiency: e.target.value })}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <option value="">Select…</option>
                    {LANGUAGE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label={`Remove language ${index + 1}`}
                onClick={() => remove(index)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
