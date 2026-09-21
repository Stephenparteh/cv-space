import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useBlocker, useLocation, useParams } from "react-router-dom";
import { AlertCircle, Check, ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { getResume, updateResume } from "@/services/resumeApi";
import { trackEvent } from "@/services/analytics";
import { toEditableFields, type ResumeEditableFields, type ResumeTemplate } from "@/types/resume";
import { ResumeTitleField, ResumeWizard } from "@/components/resume-editor/ResumeWizard";
import { VisibilitySection } from "@/components/resume-editor/VisibilitySection";

type LoadStatus = "loading" | "ready" | "notfound" | "unauthorized" | "error";
type SaveMessage = { type: "success" | "error"; text: string } | null;

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
    const clamped = Math.max(0, Math.min(7, next));
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

  const handleTemplateChange = useCallback(
    (template: ResumeTemplate) => {
      patch({ template });
      trackEvent("template_selected", { template });
    },
    [patch],
  );

  // Download PDF = print the off-screen A4 <PrintableResume> (which renders the
  // current editor state via the selected template). No API call — downloading
  // never changes what's stored in the database.
  const handleDownloadPdf = useCallback(() => {
    setPdfError("");
    try {
      window.print();
      trackEvent("resume_downloaded");
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
      trackEvent("resume_saved");
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
      <div className="mb-6 space-y-3">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to CVs
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1
              className="truncate text-xl font-semibold sm:text-2xl"
              title={fields.title.trim() || "Untitled resume"}
            >
              {fields.title.trim() || "Untitled resume"}
            </h1>
            <p aria-live="polite" className="mt-0.5 text-sm">
              {saving ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </span>
              ) : dirty ? (
                <span className="text-warning">Unsaved changes</span>
              ) : saveMessage?.type === "success" ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              ) : (
                <span className="text-muted-foreground">Last saved version</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              title="Opens your browser's print dialog — choose “Save as PDF”"
              aria-label="Download PDF"
            >
              <Download /> <span className="hidden sm:inline">Download PDF</span>
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

      <ResumeWizard
        fields={fields}
        onPatch={patch}
        onTemplateChange={handleTemplateChange}
        disabled={saving}
        step={step}
        furthest={furthest}
        onStep={goToStep}
        titleField={
          <ResumeTitleField
            value={fields.title}
            disabled={saving}
            onChange={(title) => patch({ title })}
          />
        }
        designExtra={
          <VisibilitySection
            resumeId={id}
            isPublic={visibility.isPublic}
            publicSlug={visibility.publicSlug}
            onChange={setVisibility}
            onUnauthorized={() => setStatus("unauthorized")}
          />
        }
        finishSlot={
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save resume"
            )}
          </Button>
        }
      />
    </div>
  );
};

export default ResumeEditor;
