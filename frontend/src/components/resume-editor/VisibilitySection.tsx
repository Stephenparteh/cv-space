import { useCallback, useState } from "react";
import { Globe, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { setResumeVisibility } from "@/services/resumeApi";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { SectionCard } from "./SectionCard";

interface Props {
  resumeId: string;
  isPublic: boolean;
  publicSlug: string | null;
  /** Called with the fresh visibility after a successful toggle. */
  onChange: (next: { isPublic: boolean; publicSlug: string | null }) => void;
  onUnauthorized?: () => void;
}

/**
 * Public/private control for a resume. Talks to a dedicated endpoint and keeps
 * its own state — it does not touch the editor's `fields` / unsaved-changes flow.
 */
export function VisibilitySection({
  resumeId,
  isPublic,
  publicSlug,
  onChange,
  onUnauthorized,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const publicUrl = publicSlug ? `${window.location.origin}/r/${publicSlug}` : "";

  const setVisibility = useCallback(
    async (next: boolean) => {
      if (busy || next === isPublic) return;
      setBusy(true);
      setError("");
      try {
        const { resume } = await setResumeVisibility(resumeId, next);
        onChange({ isPublic: resume.isPublic, publicSlug: resume.publicSlug ?? null });
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Couldn’t change visibility. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, isPublic, resumeId, onChange, onUnauthorized],
  );

  return (
    <SectionCard
      title="Sharing"
      description="Your resume is private by default. Make it public to share a read-only link."
    >
      <div className="inline-flex rounded-md border p-0.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => setVisibility(false)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
            !isPublic ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Lock className="h-4 w-4" /> Private
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setVisibility(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
            isPublic ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />} Public
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isPublic && publicSlug && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="mb-2 font-medium">Public link</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1 text-xs">
              {publicUrl}
            </code>
            <CopyLinkButton value={publicUrl} />
            <a href={`/r/${publicSlug}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost">
                Open
              </Button>
            </a>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
