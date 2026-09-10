import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { getMyProfile, updateMyProfile } from "@/services/profileApi";
import { listResumes } from "@/services/resumeApi";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { FormField } from "@/components/resume-editor/FormField";
import { SectionCard } from "@/components/resume-editor/SectionCard";
import { SkillsSection } from "@/components/resume-editor/SkillsSection";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import type { MyProfileInput } from "@/types/public";
import type { Resume } from "@/types/resume";

type Status = "loading" | "unauthorized" | "ready" | "error";

interface Form {
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  isPublic: boolean;
  inDirectory: boolean;
  featuredResumeId: string;
}

const EMPTY_FORM: Form = {
  displayName: "",
  headline: "",
  bio: "",
  location: "",
  skills: [],
  isPublic: false,
  inDirectory: false,
  featuredResumeId: "",
};

const ProfileSettings = () => {
  useDocumentTitle("Public profile settings");

  const [status, setStatus] = useState<Status>(() => (hasToken() ? "loading" : "unauthorized"));
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [slug, setSlug] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!hasToken()) return;
    const controller = new AbortController();
    Promise.all([getMyProfile(controller.signal), listResumes(controller.signal)])
      .then(([{ profile }, { resumes: list }]) => {
        setResumes(list);
        if (profile) {
          setForm({
            displayName: profile.displayName,
            headline: profile.headline,
            bio: profile.bio,
            location: profile.location,
            skills: profile.skills,
            isPublic: profile.isPublic,
            inDirectory: profile.inDirectory,
            featuredResumeId: profile.featuredResumeId ?? "",
          });
          setSlug(profile.slug ?? null);
        }
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 401) {
          setStatus("unauthorized");
          return;
        }
        setLoadError(err instanceof ApiError ? err.message : "Couldn’t load your profile.");
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const patch = useCallback((next: Partial<Form>) => {
    setForm((current) => {
      const merged = { ...current, ...next };
      // The directory requires a public profile.
      if (!merged.isPublic) merged.inDirectory = false;
      return merged;
    });
    setMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    const payload: MyProfileInput = {
      displayName: form.displayName,
      headline: form.headline,
      bio: form.bio,
      location: form.location,
      skills: form.skills,
      isPublic: form.isPublic,
      inDirectory: form.inDirectory,
      featuredResumeId: form.featuredResumeId || null,
    };
    try {
      const { profile } = await updateMyProfile(payload);
      setSlug(profile.slug ?? null);
      setForm((c) => ({ ...c, isPublic: profile.isPublic, inDirectory: profile.inDirectory }));
      setMessage({ type: "success", text: "Profile saved" });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus("unauthorized");
        return;
      }
      setMessage({
        type: "error",
        text: err instanceof ApiError ? err.message : "Couldn’t save your profile.",
      });
    } finally {
      setSaving(false);
    }
  }, [saving, form]);

  if (status === "unauthorized") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground">Sign in to manage your public profile.</p>
        <Link to="/login?next=%2Fsettings%2Fprofile">
          <Button>Go to sign in</Button>
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-muted-foreground">{loadError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const publicUrl = slug ? `${window.location.origin}/profile/${slug}` : "";
  const publicResumes = resumes.filter((r) => r.isPublic && r.publicSlug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Public profile</h1>
          <p className="text-sm text-muted-foreground">
            Optional. Publish a professional profile others can find in the directory.
          </p>
        </div>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          Back to dashboard
        </Link>
      </div>

      {message && (
        <div
          role="alert"
          className={cn(
            "mb-6 flex items-center gap-2 rounded-md border p-3 text-sm",
            message.type === "success"
              ? "border-green-600/30 bg-green-600/10 text-green-700"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <SectionCard title="Profile details" description="Shown on your public profile and in the directory.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Display name">
              {(id) => (
                <Input
                  id={id}
                  value={form.displayName}
                  disabled={saving}
                  onChange={(e) => patch({ displayName: e.target.value })}
                />
              )}
            </FormField>
            <FormField label="Professional title">
              {(id) => (
                <Input
                  id={id}
                  value={form.headline}
                  placeholder="e.g. Full-stack Developer"
                  disabled={saving}
                  onChange={(e) => patch({ headline: e.target.value })}
                />
              )}
            </FormField>
            <FormField label="Location" className="sm:col-span-2">
              {(id) => (
                <Input
                  id={id}
                  value={form.location}
                  placeholder="e.g. Lagos, Nigeria"
                  disabled={saving}
                  onChange={(e) => patch({ location: e.target.value })}
                />
              )}
            </FormField>
          </div>
          <FormField label="Short bio">
            {(id) => (
              <Textarea
                id={id}
                value={form.bio}
                rows={4}
                disabled={saving}
                placeholder="A couple of sentences about your work."
                onChange={(e) => patch({ bio: e.target.value })}
              />
            )}
          </FormField>
        </SectionCard>

        <SkillsSection
          skills={form.skills}
          disabled={saving}
          onChange={(skills) => patch({ skills })}
        />

        <SectionCard title="Featured resume" description="Optionally show one of your public resumes on your profile.">
          <FormField label="Resume">
            {(id) => (
              <select
                id={id}
                value={form.featuredResumeId}
                disabled={saving}
                onChange={(e) => patch({ featuredResumeId: e.target.value })}
                className={cn(
                  "flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <option value="">None</option>
                {publicResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title.trim() || "Untitled resume"}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          {publicResumes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Make a resume public from its editor to feature it here.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Visibility" description="Your profile is private until you publish it.">
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input"
                checked={form.isPublic}
                disabled={saving}
                onChange={(e) => patch({ isPublic: e.target.checked })}
              />
              <span>
                <span className="font-medium">Public profile</span>
                <span className="block text-muted-foreground">
                  Anyone with the link can view your profile.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input"
                checked={form.inDirectory}
                disabled={saving || !form.isPublic}
                onChange={(e) => patch({ inDirectory: e.target.checked })}
              />
              <span>
                <span className="font-medium">Show me in the public directory</span>
                <span className="block text-muted-foreground">
                  Requires a public profile. Lets visitors find you by profession or skill.
                </span>
              </span>
            </label>
          </div>

          {form.isPublic && slug && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="mb-2 font-medium">Public profile link</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1 text-xs">
                  {publicUrl}
                </code>
                <CopyLinkButton value={publicUrl} />
                <Link to={`/profile/${slug}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
