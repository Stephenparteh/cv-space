import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PersonalInfo } from "@/types/resume";
import { FormField } from "./FormField";
import { PhotoField } from "./PhotoField";
import { SectionCard } from "./SectionCard";

interface Props {
  value: PersonalInfo;
  onChange: (next: PersonalInfo) => void;
  disabled?: boolean;
}

type TextFieldConfig = {
  key: keyof PersonalInfo;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
};

const TEXT_FIELDS: TextFieldConfig[] = [
  { key: "fullName", label: "Full name", placeholder: "Ada Lovelace", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", placeholder: "ada@example.com", autoComplete: "email" },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 0100", autoComplete: "tel" },
  { key: "phone2", label: "Phone 2", type: "tel", placeholder: "Optional", autoComplete: "tel" },
  { key: "location", label: "Location", placeholder: "London, UK", autoComplete: "address-level2" },
  { key: "website", label: "Website", type: "url", placeholder: "https://ada.dev" },
  { key: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/ada" },
  { key: "nationality", label: "Nationality", placeholder: "Optional" },
  { key: "religion", label: "Religion", placeholder: "Optional" },
];

const GENDER_OPTIONS = ["", "Female", "Male", "Non-binary", "Prefer not to say"];

export function PersonalInfoSection({ value, onChange, disabled }: Props) {
  const set = (key: keyof PersonalInfo, v: string) => onChange({ ...value, [key]: v });

  return (
    <SectionCard title="Personal information" description="How employers reach you.">
      <PhotoField value={value.photo} disabled={disabled} onChange={(photo) => set("photo", photo)} />

      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <FormField key={field.key} label={field.label} hint={field.hint}>
            {(id) => (
              <Input
                id={id}
                type={field.type ?? "text"}
                value={value[field.key]}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                disabled={disabled}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
          </FormField>
        ))}

        <FormField label="Date of birth">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={value.dateOfBirth}
              disabled={disabled}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          )}
        </FormField>

        <FormField label="Gender">
          {(id) => (
            <select
              id={id}
              value={value.gender}
              disabled={disabled}
              onChange={(e) => set("gender", e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || "Select…"}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <p className="text-xs text-muted-foreground">
        Date of birth, gender, religion and nationality are optional and are never shown on a
        public resume.
      </p>
    </SectionCard>
  );
}
