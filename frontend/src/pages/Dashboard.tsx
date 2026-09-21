import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, FilePlus2, Globe, Loader2, Lock, Pencil, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { BrandMark } from "@/components/brand/BrandMark";
import { TemplateThumbnail } from "@/components/resume-preview/TemplateThumbnail";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { createResume, deleteResume, listResumes } from "@/services/resumeApi";
import type { Resume } from "@/types/resume";

const publicUrlFor = (slug: string): string => `${window.location.origin}/r/${slug}`;

type Status = "loading" | "unauthorized" | "error" | "ready";

const formatUpdated = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>(() =>
    hasToken() ? "loading" : "unauthorized",
  );
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Resolves the list and sets a terminal status. setState here happens in a
  // microtask (not synchronously in an effect body), so it's safe to call from
  // useEffect and from the Retry handler alike.
  const fetchResumes = useCallback(
    (signal?: AbortSignal) =>
      listResumes(signal)
        .then(({ resumes: list }) => {
          setResumes(list);
          setStatus("ready");
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (err instanceof ApiError && err.status === 401) {
            setStatus("unauthorized");
            return;
          }
          setLoadError(err instanceof ApiError ? err.message : "Couldn’t load your CVs.");
          setStatus("error");
        }),
    [],
  );

  const retry = useCallback(() => {
    setStatus("loading");
    setLoadError("");
    void fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    if (!hasToken()) return;
    const controller = new AbortController();
    // `status` is already "loading" from the lazy initializer.
    void fetchResumes(controller.signal);
    return () => controller.abort();
  }, [fetchResumes]);

  const handleCreate = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    setActionError("");
    try {
      const { resume } = await createResume();
      navigate(`/resumes/${resume.id}/edit`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus("unauthorized");
        return;
      }
      setActionError(
        err instanceof ApiError ? err.message : "Couldn’t create a new CV. Please try again.",
      );
      setCreating(false);
    }
  }, [creating, navigate]);

  const handleDelete = useCallback(
    async (resume: Resume) => {
      const label = resume.title.trim() || "Untitled CV";
      if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;

      setDeletingId(resume.id);
      setActionError("");
      try {
        await deleteResume(resume.id);
        setResumes((current) => current.filter((r) => r.id !== resume.id));
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          setStatus("unauthorized");
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          // already gone — reconcile the list anyway
          setResumes((current) => current.filter((r) => r.id !== resume.id));
          return;
        }
        setActionError(
          err instanceof ApiError ? err.message : "Couldn’t delete that CV. Please try again.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  if (status === "unauthorized") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground">Sign in to see and manage your CVs.</p>
        <Link to="/login?next=%2Fdashboard">
          <Button>Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content-wide px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your CVs</h1>
          <p className="text-sm text-muted-foreground">Open one to keep editing, or start another.</p>
        </div>
        <Button onClick={handleCreate} disabled={creating || status === "loading"}>
          {creating ? <Loader2 className="animate-spin" /> : <FilePlus2 />}
          {creating ? "Creating…" : "Create a new CV"}
        </Button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Public profile</span>
          <span className="text-muted-foreground">— control your directory listing</span>
        </div>
        <Link to="/settings/profile">
          <Button variant="outline" size="sm">
            Manage profile
          </Button>
        </Link>
      </div>

      {status === "loading" && (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your CVs…
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {loadError || "Something went wrong."}
          </p>
          <Button variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {status === "ready" && resumes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
          <BrandMark size={40} title="CV Space" />
          <div>
            <h2 className="text-lg font-semibold">You haven't created a CV yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It takes a few minutes — start with your personal details and add the rest as you go.
            </p>
          </div>
          <Button className="mt-2" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="animate-spin" /> : <FilePlus2 />}
            Create my first CV
          </Button>
        </div>
      )}

      {status === "ready" && resumes.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const label = resume.title.trim() || "Untitled CV";
            const busy = deletingId === resume.id;
            return (
              <li key={resume.id}>
                <div className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-card transition-shadow duration-standard ease-standard hover:shadow-card-hover">
                  <Link
                    to={`/resumes/${resume.id}/edit`}
                    className="shrink-0"
                    aria-label={`Open ${label}`}
                    tabIndex={-1}
                  >
                    <TemplateThumbnail data={resume} className="w-16 sm:w-20" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="truncate font-semibold" title={label}>
                      {label}
                    </h2>
                    <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                      {resume.template} · Updated {formatUpdated(resume.updatedAt)}
                    </p>
                    {resume.isPublic ? (
                      <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-xs text-success">
                        <Globe className="h-3 w-3" aria-hidden="true" /> Public
                      </span>
                    ) : (
                      <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" aria-hidden="true" /> Private
                      </span>
                    )}

                    <div className="mt-auto flex items-center gap-1.5 pt-3">
                      <Button
                        asChild
                        size="sm"
                        className={busy ? "pointer-events-none flex-1 opacity-50" : "flex-1"}
                      >
                        <Link to={`/resumes/${resume.id}/edit`}>
                          <Pencil /> Edit
                        </Link>
                      </Button>
                      {resume.isPublic && resume.publicSlug && (
                        <CopyLinkButton
                          value={publicUrlFor(resume.publicSlug)}
                          variant="ghost"
                          label=""
                          aria-label={`Copy public link for ${label}`}
                          className="shrink-0"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(resume)}
                        disabled={busy}
                        aria-label={`Delete ${label}`}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
