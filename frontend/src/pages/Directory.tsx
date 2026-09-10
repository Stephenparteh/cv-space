import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { getDirectory } from "@/services/publicApi";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import type { DirectoryEntry } from "@/types/public";

type Status = "loading" | "ready" | "error";

const Directory = () => {
  useDocumentTitle("Directory", "Discover professionals and freelancers by profession and skill.");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeQ = searchParams.get("q") ?? "";
  const activeSkill = searchParams.get("skill") ?? "";

  const [qInput, setQInput] = useState(() => activeQ);
  const [skillInput, setSkillInput] = useState(() => activeSkill);
  const [status, setStatus] = useState<Status>("loading");
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [error, setError] = useState("");

  // Fetch whenever the active (URL) filters change. Terminal state is set
  // asynchronously in the promise callbacks, not synchronously in the effect.
  useEffect(() => {
    const controller = new AbortController();
    getDirectory({ q: activeQ, skill: activeSkill }, controller.signal)
      .then(({ profiles }) => {
        setEntries(profiles);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Couldn’t load the directory.");
        setStatus("error");
      });
    return () => controller.abort();
  }, [activeQ, activeSkill]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    const next: Record<string, string> = {};
    if (qInput.trim()) next.q = qInput.trim();
    if (skillInput.trim()) next.skill = skillInput.trim();
    setSearchParams(next);
  };

  const clear = () => {
    setStatus("loading");
    setQInput("");
    setSkillInput("");
    setSearchParams({});
  };

  const hasFilters = Boolean(activeQ || activeSkill);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Directory</h1>
        <p className="text-sm text-muted-foreground">
          Discover professionals who chose to be listed. Search by profession or skill.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-8 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="dir-q">Profession / title</Label>
          <Input
            id="dir-q"
            value={qInput}
            placeholder="e.g. Frontend Developer"
            onChange={(e) => setQInput(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dir-skill">Skill</Label>
          <Input
            id="dir-skill"
            value={skillInput}
            placeholder="e.g. React"
            onChange={(e) => setSkillInput(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            <Search /> Search
          </Button>
          {hasFilters && (
            <Button type="button" variant="ghost" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
      </form>

      {status === "loading" && (
        <div className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {status === "ready" && entries.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h2 className="text-lg font-semibold">No profiles match your search</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different profession or skill."
              : "No one has joined the directory yet."}
          </p>
        </div>
      )}

      {status === "ready" && entries.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <li key={entry.slug} className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="font-semibold">{entry.displayName || "Unnamed"}</h2>
              {entry.headline && <p className="text-sm text-muted-foreground">{entry.headline}</p>}
              {entry.location && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {entry.location}
                </p>
              )}
              {entry.bio && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.bio}</p>
              )}
              {entry.skills.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {entry.skills.slice(0, 6).map((skill, i) => (
                    <li key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                      {skill}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/profile/${entry.slug}`}>
                  <Button size="sm" variant="outline">
                    View profile
                  </Button>
                </Link>
                {entry.resumeSlug && (
                  <Link to={`/r/${entry.resumeSlug}`}>
                    <Button size="sm" variant="ghost">
                      View resume
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Directory;
