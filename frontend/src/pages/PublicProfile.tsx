import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { getPublicProfile } from "@/services/publicApi";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { toEditableFields } from "@/types/resume";
import type { PublicProfile as PublicProfileData } from "@/types/public";
import { ResumeDocument } from "@/components/resume-preview/ResumeDocument";

type Status = "loading" | "ready" | "notfound" | "error";

const PublicProfile = () => {
  const { slug = "" } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<PublicProfileData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPublicProfile(slug, controller.signal)
      .then(({ profile }) => {
        setData(profile);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus(err instanceof ApiError && err.status === 404 ? "notfound" : "error");
      });
    return () => controller.abort();
  }, [slug]);

  useDocumentTitle(
    status === "ready" && data
      ? [data.displayName, data.headline].filter(Boolean).join(" — ") || "Profile"
      : "Profile",
    status === "ready" ? data?.bio?.slice(0, 160) || undefined : undefined,
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading profile…
      </div>
    );
  }

  if (status === "notfound" || status === "error" || !data) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-xl font-semibold">This profile isn’t available</h1>
        <p className="max-w-md text-muted-foreground">
          The link may be incorrect, or this profile is private.
        </p>
        <Link to="/directory">
          <Button variant="outline">Browse the directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="border-b pb-6">
        <h1 className="text-2xl font-bold">{data.displayName || "Unnamed profile"}</h1>
        {data.headline && <p className="mt-1 text-lg text-muted-foreground">{data.headline}</p>}
        {data.location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {data.location}
          </p>
        )}
      </header>

      {data.bio && (
        <section className="py-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            About
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed">{data.bio}</p>
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="border-t py-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, i) => (
              <li key={i} className="rounded bg-muted px-2 py-0.5 text-xs">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.featuredResume && (
        <section className="border-t py-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resume
            </h2>
            <Link to={`/r/${data.featuredResume.slug}`}>
              <Button size="sm" variant="outline">
                Open full resume
              </Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div className="mx-auto w-full max-w-[820px] px-6 py-8 sm:px-10">
                <ResumeDocument data={toEditableFields(data.featuredResume.resume)} />
              </div>
            </div>
          </div>
        </section>
      )}

      <p className="mt-2 pt-6 text-center text-xs text-muted-foreground">
        Public profile · read-only
      </p>
    </div>
  );
};

export default PublicProfile;
