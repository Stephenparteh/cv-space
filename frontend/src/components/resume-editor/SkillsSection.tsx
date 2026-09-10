import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "./SectionCard";

interface Props {
  skills: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function SkillsSection({ skills, onChange, disabled }: Props) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const value = draft.trim();
    if (!value) return;
    const exists = skills.some((s) => s.toLowerCase() === value.toLowerCase());
    if (!exists) onChange([...skills, value]);
    setDraft("");
  };

  const editAt = (index: number, value: string) => {
    onChange(skills.map((s, i) => (i === index ? value : s)));
  };
  const removeAt = (index: number) => onChange(skills.filter((_s, i) => i !== index));

  return (
    <SectionCard title="Skills" description="Add the skills you want to highlight.">
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      ) : (
        <ul className="space-y-2">
          {skills.map((skill, index) => (
            <li key={index} className="flex items-center gap-2">
              <Input
                value={skill}
                disabled={disabled}
                aria-label={`Skill ${index + 1}`}
                onChange={(e) => editAt(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove ${skill || `skill ${index + 1}`}`}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          disabled={disabled}
          placeholder="e.g. TypeScript"
          aria-label="New skill"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addDraft} disabled={disabled || !draft.trim()}>
          <Plus /> Add
        </Button>
      </div>
    </SectionCard>
  );
}
