import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useBlocker, useLocation, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { getResume, updateResume } from "@/services/resumeApi";
import { toEditableFields, type ResumeEditableFields } from "@/types/resume";
import { CertificationsSection } from "@/components/resume-editor/CertificationsSection";
import { EducationSection } from "@/components/resume-editor/EducationSection";
import { ExperienceSection } from "@/components/resume-editor/ExperienceSection";
import { FormField } from "@/components/resume-editor/FormField";
import { LanguagesSection } from "@/components/resume-editor/LanguagesSection";
import { PersonalInfoSection } from "@/components/resume-editor/PersonalInfoSection";
import { ReferencesSection } from "@/components/resume-editor/ReferencesSection";
import { SectionCard } from "@/components/resume-editor/SectionCard";
import { SkillsSection } from "@/components/resume-editor/SkillsSection";
import { Stepper } from "@/components/resume-editor/Stepper";
import { SummarySection } from "@/components/resume-editor/SummarySection";
import { TemplateSelector } from "@/components/resume-editor/TemplateSelector";
import { VisibilitySection } from "@/components/resume-editor/VisibilitySection";
import { ResumePreview } from "@/components/resume-preview/ResumePreview";
import { PrintableResume } from "@/components/resume-preview/PrintableResume";

type LoadStatus = "loading" | "ready" | "notfound" | "unauthorized" | "error";
type SaveMessage = { type: "success" | "error"; text: string } | null;

const STEP_LABELS = [
  "Personal",
  "Summary",
  "Experience",
  "Education",
  "Certifications",
  "Skills & Languages",
  "References",
  "Design",
] as const;
const LAST_STEP = STEP_LABELS.length - 1;

const CenteredMessage = ({ children }: { children: ReactNode }) => (
  <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
    {children}
  </div>
);

const ResumeEditor = () => {
  const { id = "" } = useParams();
  // Remount per id so all state re-initializes cleanly when navigating
  // between different resumes.
  return <ResumeEditorInner key={id} id={id} />;
};

const ResumeEditorInner = ({ id }: { id: string }) => {
  const location = useLocation();

  const [status, setStatus] = useState<LoadStatus>(() => (hasToken() ? "loading" : "unauthorized"));
  const [loadError, setLoadError] = useState("");
  const [fields, setFields] = useState<ResumeEditableFields | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage>(null);
  const [pdfError, setPdfError] = useState("");
  // Wizard position — pure UI state; all resume data lives in `fields`, so
  // switching steps never loses anything.
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  // Public-sharing state — separate from `fields`, so it never affects `dirty`
  // or the save flow.
  const [visibility, setVisibility] = useState<{ isPublic: boolean; publicSlug: string | null }>({
    isPublic: false,
    publicSlug: null,
  });

  const goToStep = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(LAST_STEP, next));
    setStep(clamped);
    setFurthest((f) => Math.max(f, clamped));
  }, []);

  useEffect(() => {
    if (!hasToken()) return;

    const controller = new AbortController();

    getResume(id, controller.signal)
      .then(({ resume }) => {
        const editable = toEditableFields(resume);
        setFields(editable);
        setSavedSnapshot(JSON.stringify(editable));
        setVisibility({ isPublic: resume.isPublic, publicSlug: resume.publicSlug ?? null });
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError) {
          if (err.status === 401) return setStatus("unauthorized");
          if (err.status === 404) return setStatus("notfound");
          setLoadError(err.message);
          return setStatus("error");
        }
        setLoadError("Something went wrong while loading this resume.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [id]);

  const dirty = fields !== null && JSON.stringify(fields) !== savedSnapshot;

  // Warn before a browser refresh / tab close with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Warn before in-app (React Router) navigation away with unsaved changes —
  // the editor's Back link, the header logo, the browser Back button, etc.
  // Same `dirty` flag as above; nothing is saved automatically.
  const blocker = useBlocker(dirty);
  const promptingRef = useRef(false);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (promptingRef.current) return;
    promptingRef.current = true;
    const leave = window.confirm(
      "You have unsaved changes. Are you sure you want to leave?",
    );
    promptingRef.current = false;
    if (leave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  const patch = useCallback((next: Partial<ResumeEditableFields>) => {
    setFields((current) => (current ? { ...current, ...next } : current));
    setSaveMessage(null);
  }, []);

  // Download PDF = print the off-screen A4 <PrintableResume> (which renders the
  // current editor state via the selected template). No API call — downloading
  // never changes what's stored in the database.
  const handleDownloadPdf = useCallback(() => {
    setPdfError("");
    try {
      window.print();
    } catch {
      setPdfError("Couldn’t open the print dialog. Please try again.");
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || !fields || !id) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const { resume } = await updateResume(id, fields);
      const editable = toEditableFields(resume);
      setFields(editable);
      setSavedSnapshot(JSON.stringify(editable));
      setSaveMessage({ type: "success", text: "Saved" });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus("unauthorized");
        return;
      }
      const text =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving. Please try again.";
      setSaveMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  }, [saving, fields, id]);

  if (status === "loading") {
    return (
      <CenteredMessage>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading resume…</p>
      </CenteredMessage>
    );
  }

  if (status === "unauthorized") {
    return (
      <CenteredMessage>
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground">You need to sign in to edit this resume.</p>
        <Link to={`/login?next=${encodeURIComponent(location.pathname)}`}>
          <Button>Go to sign in</Button>
        </Link>
      </CenteredMessage>
    );
  }

  if (status === "notfound") {
    return (
      <CenteredMessage>
        <h1 className="text-xl font-semibold">Resume not found</h1>
        <p className="text-muted-foreground">
          This resume doesn’t exist or you don’t have access to it.
        </p>
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </CenteredMessage>
    );
  }

  if (status === "error" || !fields) {
    return (
      <CenteredMessage>
        <AlertCircle className="h-6 w-6 text-destructive" />
        <h1 className="text-xl font-semibold">Couldn’t load this resume</h1>
        <p className="max-w-md text-muted-foreground">{loadError || "Please try again."}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
      </CenteredMessage>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1
            className="truncate text-sm font-medium"
            title={fields.title.trim() || "Untitled resume"}
          >
            {fields.title.trim() || "Untitled resume"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span aria-live="polite" className="text-sm">
            {dirty ? (
              <span className="text-amber-600">Unsaved changes</span>
            ) : saveMessage?.type === "success" ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" /> Saved
              </span>
            ) : null}
          </span>
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            title="Opens your browser's print dialog — choose “Save as PDF”"
          >
            <Download /> Download PDF
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save resume"
            )}
          </Button>
        </div>
      </div>

      {(saveMessage?.type === "error" || pdfError) && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{pdfError || saveMessage?.text}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Editor wizard */}
        <div className="space-y-6 lg:min-w-0">
          <Stepper steps={[...STEP_LABELS]} current={step} furthest={furthest} onStep={goToStep} />

          {step === 0 && (
            <>
              <SectionCard title="Resume details" description="A name to identify this resume.">
                <FormField label="Resume title">
                  {(fieldId) => (
                    <Input
                      id={fieldId}
                      value={fields.title}
                      disabled={saving}
                      placeholder="Software Developer Resume"
                      onChange={(e) => patch({ title: e.target.value })}
                    />
                  )}
                </FormField>
              </SectionCard>
              <PersonalInfoSection
                value={fields.personalInfo}
                disabled={saving}
                onChange={(personalInfo) => patch({ personalInfo })}
              />
            </>
          )}

          {step === 1 && (
            <SummarySection
              value={fields.summary}
              disabled={saving}
              onChange={(summary) => patch({ summary })}
            />
          )}

          {step === 2 && (
            <ExperienceSection
              items={fields.experience}
              disabled={saving}
              onChange={(experience) => patch({ experience })}
            />
          )}

          {step === 3 && (
            <EducationSection
              items={fields.education}
              disabled={saving}
              onChange={(education) => patch({ education })}
            />
          )}

          {step === 4 && (
            <CertificationsSection
              items={fields.certifications}
              disabled={saving}
              onChange={(certifications) => patch({ certifications })}
            />
          )}

          {step === 5 && (
            <>
              <SkillsSection
                skills={fields.skills}
                disabled={saving}
                onChange={(skills) => patch({ skills })}
              />
              <LanguagesSection
                items={fields.languages}
                disabled={saving}
                onChange={(languages) => patch({ languages })}
              />
            </>
          )}

          {step === 6 && (
            <ReferencesSection
              items={fields.references}
              disabled={saving}
              onChange={(references) => patch({ references })}
            />
          )}

          {step === 7 && (
            <>
              <TemplateSelector
                value={fields.template}
                disabled={saving}
                onChange={(template) => patch({ template })}
              />
              <VisibilitySection
                resumeId={id}
                isPublic={visibility.isPublic}
                publicSlug={visibility.publicSlug}
                onChange={setVisibility}
                onUnauthorized={() => setStatus("unauthorized")}
              />
            </>
          )}

          <div className="flex items-center justify-between gap-3 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(step - 1)}
              disabled={step === 0}
            >
              <ChevronLeft /> Back
            </Button>
            {step < LAST_STEP ? (
              <Button type="button" onClick={() => goToStep(step + 1)}>
                Next <ChevronRight />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving || !dirty}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save resume"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Live preview — reads the editor state directly, no save required.
            Decorative: it duplicates the form data as a visual mock-up, so it is
            hidden from assistive tech (which would otherwise see a second copy of
            every heading). The editable form is the accessible source of truth. */}
        <div className="lg:sticky lg:top-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Live preview</span>
            <span className="text-xs capitalize text-muted-foreground">
              {fields.template} template
            </span>
          </div>
          <div
            className="lg:max-h-[calc(100vh-8rem)] lg:overflow-auto lg:pr-1"
            aria-hidden="true"
          >
            <ResumePreview data={fields} />
          </div>
        </div>
      </div>

      {/* Off-screen A4 document used by "Download PDF" (window.print). */}
      <PrintableResume data={fields} />
    </div>
  );
};

export default ResumeEditor;
