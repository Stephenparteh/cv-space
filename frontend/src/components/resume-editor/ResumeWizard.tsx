import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ResumeEditableFields, ResumeTemplate } from "@/types/resume";
import { CertificationsSection } from "./CertificationsSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { FormField } from "./FormField";
import { LanguagesSection } from "./LanguagesSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ReferencesSection } from "./ReferencesSection";
import { SectionCard } from "./SectionCard";
import { SkillsSection } from "./SkillsSection";
import { Stepper } from "./Stepper";
import { SummarySection } from "./SummarySection";
import { TemplateSelector } from "./TemplateSelector";
import { ResumePreview } from "@/components/resume-preview/ResumePreview";
import { PrintableResume } from "@/components/resume-preview/PrintableResume";

export const WIZARD_STEP_LABELS = [
  "Personal",
  "Summary",
  "Experience",
  "Education",
  "Certifications",
  "Skills & Languages",
  "References",
  "Design",
] as const;
export const WIZARD_LAST_STEP = WIZARD_STEP_LABELS.length - 1;

interface Props {
  fields: ResumeEditableFields;
  onPatch: (patch: Partial<ResumeEditableFields>) => void;
  /** Wraps `onPatch({ template })` — lets a caller add analytics etc. */
  onTemplateChange: (template: ResumeTemplate) => void;
  disabled?: boolean;
  step: number;
  furthest: number;
  onStep: (index: number) => void;
  /**
   * Rendered on the Design step (step 8) below the template selector.
   * The authenticated editor uses this slot for `<VisibilitySection>`; the
   * guest builder leaves it out (a guest resume has nothing to publish yet).
   */
  designExtra?: ReactNode;
  /**
   * Rendered as the bottom-nav primary action on the last step, replacing the
   * usual "Next" button (e.g. "Save resume" for the authenticated editor,
   * "Save my resume" for the guest builder). Rendered twice (desktop inline
   * bar + mobile sticky bar) — keep it small enough to fit both.
   */
  finishSlot: ReactNode;
  /** Optional first card above "Personal information" on step 1 (resume title). */
  titleField?: ReactNode;
}

/**
 * The 8-step résumé wizard body: stepper, per-step form sections, the
 * Back/Next nav, the live preview, and the off-screen print document.
 *
 * Pure/presentational — all résumé data lives in `fields` on the caller, so
 * this component works identically for the authenticated editor (persisted
 * to the API) and the guest builder (persisted to localStorage).
 *
 * Below `lg`, editor and preview are never squeezed side by side: a
 * segmented Edit/Preview toggle switches between them (both keep their
 * scroll position — neither ever unmounts), and Back/Next move into a fixed
 * bottom bar so they're reachable without scrolling past the whole preview.
 */
export function ResumeWizard({
  fields,
  onPatch,
  onTemplateChange,
  disabled,
  step,
  furthest,
  onStep,
  designExtra,
  finishSlot,
  titleField,
}: Props) {
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  const nav = (
    <div className="flex items-center justify-between gap-3">
      <Button type="button" variant="outline" onClick={() => onStep(step - 1)} disabled={step === 0}>
        <ChevronLeft /> Back
      </Button>
      {step < WIZARD_LAST_STEP ? (
        <Button type="button" onClick={() => onStep(step + 1)}>
          Next <ChevronRight />
        </Button>
      ) : (
        finishSlot
      )}
    </div>
  );

  return (
    <div className="pb-24 lg:pb-0">
      {/* Below lg: switch between editing and previewing instead of stacking
          both in full — the preview never has to be scrolled past to reach
          the next field. Neither side unmounts, so scroll position and any
          in-progress input are preserved when switching back. */}
      <div className="mb-5 inline-flex rounded-md border border-border bg-card p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("edit")}
          aria-pressed={mobileView === "edit"}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors duration-micro",
            mobileView === "edit" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          aria-pressed={mobileView === "preview"}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors duration-micro",
            mobileView === "preview" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Preview
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Editor wizard */}
        <div className={cn("space-y-6 lg:min-w-0", mobileView === "preview" && "hidden lg:block")}>
          <Stepper steps={[...WIZARD_STEP_LABELS]} current={step} furthest={furthest} onStep={onStep} />

          {step === 0 && (
            <>
              {titleField}
              <PersonalInfoSection
                value={fields.personalInfo}
                disabled={disabled}
                onChange={(personalInfo) => onPatch({ personalInfo })}
              />
            </>
          )}

          {step === 1 && (
            <SummarySection
              value={fields.summary}
              disabled={disabled}
              onChange={(summary) => onPatch({ summary })}
            />
          )}

          {step === 2 && (
            <ExperienceSection
              items={fields.experience}
              disabled={disabled}
              onChange={(experience) => onPatch({ experience })}
            />
          )}

          {step === 3 && (
            <EducationSection
              items={fields.education}
              disabled={disabled}
              onChange={(education) => onPatch({ education })}
            />
          )}

          {step === 4 && (
            <CertificationsSection
              items={fields.certifications}
              disabled={disabled}
              onChange={(certifications) => onPatch({ certifications })}
            />
          )}

          {step === 5 && (
            <>
              <SkillsSection
                skills={fields.skills}
                disabled={disabled}
                onChange={(skills) => onPatch({ skills })}
              />
              <LanguagesSection
                items={fields.languages}
                disabled={disabled}
                onChange={(languages) => onPatch({ languages })}
              />
            </>
          )}

          {step === 6 && (
            <ReferencesSection
              items={fields.references}
              disabled={disabled}
              onChange={(references) => onPatch({ references })}
            />
          )}

          {step === 7 && (
            <>
              <TemplateSelector value={fields.template} data={fields} disabled={disabled} onChange={onTemplateChange} />
              {designExtra}
            </>
          )}

          {/* Desktop: nav stays inline, at the end of the form column. */}
          <div className="hidden pb-4 lg:block">{nav}</div>
        </div>

        {/* Live preview — reads the editor state directly, no save required.
            Decorative: it duplicates the form data as a visual mock-up, so it is
            hidden from assistive tech (which would otherwise see a second copy of
            every heading). The editable form is the accessible source of truth. */}
        <div className={cn("lg:sticky lg:top-6", mobileView === "edit" && "hidden lg:block")}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Live preview</span>
            <span className="text-xs capitalize text-muted-foreground">{fields.template} template</span>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 sm:p-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
            <div aria-hidden="true">
              <ResumePreview data={fields} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: nav pinned to the bottom, reachable without scrolling past
          the step content or the preview. The pb-24 on the root wrapper
          keeps the last field from ever sitting underneath it. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3 lg:hidden">
        {nav}
      </div>

      {/* Off-screen A4 document used by "Download PDF" (window.print). */}
      <PrintableResume data={fields} />
    </div>
  );
}

/** Small helper so both callers build the step-1 "resume title" card identically. */
export function ResumeTitleField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (title: string) => void;
}) {
  return (
    <SectionCard title="Resume details" description="A name to identify this resume.">
      <FormField label="Resume title">
        {(fieldId) => (
          <Input
            id={fieldId}
            value={value}
            disabled={disabled}
            placeholder="Software Developer Resume"
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </FormField>
    </SectionCard>
  );
}
