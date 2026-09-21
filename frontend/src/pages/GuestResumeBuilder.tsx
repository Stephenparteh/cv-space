import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Download, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { createResume } from "@/services/resumeApi";
import { trackEvent } from "@/services/analytics";
import { clearGuestResume, hasGuestResume, loadGuestResume, saveGuestResume } from "@/services/guestResume";
import { toEditableFields, type ResumeEditableFields, type ResumeTemplate } from "@/types/resume";
import { ResumeTitleField, ResumeWizard, WIZARD_LAST_STEP } from "@/components/resume-editor/ResumeWizard";
import { SaveGuestResumeDialog } from "@/components/resume-editor/SaveGuestResumeDialog";

const CLAIM_PATH = "/resumes/claim-guest";

/**
 * Build a résumé with zero account friction. State lives only in this
 * browser's localStorage (see services/guestResume.ts) — nothing is sent to
 * the server unless the guest explicitly saves, at which point it's handed
 * off to /resumes/claim-guest after they register or log in.
 */
const GuestResumeBuilder = () => {
  const navigate = useNavigate();

  const startedTrackedRef = useRef(false);
  const completedTrackedRef = useRef(false);

  const [fields, setFields] = useState<ResumeEditableFields>(
    () => loadGuestResume() ?? toEditableFields(undefined),
  );
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fire exactly once per browser-side "new guest resume" — in an effect (not
  // during render, and not touching a ref while rendering) so React's
  // dev-mode double-render/double-effect can't double-count it. Re-reads
  // storage here (not the initializer's captured value) since nothing but
  // `patch`/`handleStartNew` ever writes to it, so this is still an accurate
  // "was there nothing here yet" check at mount time.
  useEffect(() => {
    if (!hasGuestResume() && !startedTrackedRef.current) {
      startedTrackedRef.current = true;
      trackEvent("resume_started");
    }
  }, []);

  const goToStep = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(WIZARD_LAST_STEP, next));
    setStep(clamped);
    setFurthest((f) => Math.max(f, clamped));
    if (clamped === WIZARD_LAST_STEP && !completedTrackedRef.current) {
      completedTrackedRef.current = true;
      trackEvent("resume_completed");
    }
  }, []);

  const patch = useCallback((next: Partial<ResumeEditableFields>) => {
    setFields((current) => {
      const merged = { ...current, ...next };
      saveGuestResume(merged);
      return merged;
    });
  }, []);

  const handleTemplateChange = useCallback(
    (template: ResumeTemplate) => {
      patch({ template });
      trackEvent("template_selected", { template });
    },
    [patch],
  );

  const handleDownloadPdf = useCallback(() => {
    try {
      window.print();
      trackEvent("resume_downloaded");
    } catch {
      setError("Couldn’t open the print dialog. Please try again.");
    }
  }, []);

  const handleStartNew = useCallback(() => {
    if (!window.confirm("Start a new resume? This clears what you've entered here.")) return;
    clearGuestResume();
    completedTrackedRef.current = false;
    setFields(toEditableFields(undefined));
    setStep(0);
    setFurthest(0);
    setError("");
    // An explicit, deliberate user action — track it directly rather than via
    // an effect (there's no re-mount to trigger one here).
    trackEvent("resume_started");
  }, []);

  // Already signed in (e.g. opened /build while logged in) — save immediately,
  // no need for the register/login prompt.
  const handleSaveClick = useCallback(async () => {
    setError("");
    if (!hasToken()) {
      setSaveDialogOpen(true);
      return;
    }
    setSaving(true);
    try {
      const { resume } = await createResume(fields);
      clearGuestResume();
      trackEvent("resume_saved");
      navigate(`/resumes/${resume.id}/edit`, { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn’t save your resume right now. Please try again.",
      );
      setSaving(false);
    }
  }, [fields, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-foreground">
        You're building as a guest — this resume is kept only in this browser. Save it anytime to
        keep it permanently and edit it later.
      </div>

      <div className="mb-6 space-y-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1
              className="truncate text-xl font-semibold sm:text-2xl"
              title={fields.title.trim() || "Untitled resume"}
            >
              {fields.title.trim() || "Untitled resume"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Working copy — saved in this browser</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleStartNew}
              title="Clear this browser's guest resume"
              aria-label="Start new resume"
            >
              <RotateCcw /> <span className="hidden sm:inline">Start new resume</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              title="Opens your browser's print dialog — choose “Save as PDF”"
              aria-label="Download PDF"
            >
              <Download /> <span className="hidden sm:inline">Download PDF</span>
            </Button>
            <Button onClick={handleSaveClick} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" /> Saving…
                </>
              ) : (
                "Save my resume"
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ResumeWizard
        fields={fields}
        onPatch={patch}
        onTemplateChange={handleTemplateChange}
        step={step}
        furthest={furthest}
        onStep={goToStep}
        titleField={
          <ResumeTitleField value={fields.title} onChange={(title) => patch({ title })} />
        }
        finishSlot={
          <Button onClick={handleSaveClick} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save my resume"
            )}
          </Button>
        }
      />

      <SaveGuestResumeDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        next={CLAIM_PATH}
      />
    </div>
  );
};

export default GuestResumeBuilder;
