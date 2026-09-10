import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { getPublicResume } from "@/services/publicApi";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { toEditableFields } from "@/types/resume";
import type { PublicResume as PublicResumeData } from "@/types/public";
import { ResumeDocument } from "@/components/resume-preview/ResumeDocument";

type Status = "loading" | "ready" | "notfound" | "error";

const PublicResume = () => {
  const { slug = "" } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<PublicResumeData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPublicResume(slug, controller.signal)
      .then(({ resume }) => {
        setData(resume);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus(err instanceof ApiError && err.status === 404 ? "notfound" : "error");
      });
    return () => controller.abort();
  }, [slug]);

  const name = data?.personalInfo.fullName?.trim() || data?.title || "Resume";
  useDocumentTitle(
    status === "ready" ? `${name} — Resume` : "Resume",
    status === "ready" ? data?.summary?.slice(0, 160) || undefined : undefined,
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading resume…
      </div>
    );
  }

  if (status === "notfound" || status === "error" || !data) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-xl font-semibold">This resume isn’t available</h1>
        <p className="max-w-md text-muted-foreground">
          The link may be incorrect, or the owner has made this resume private.
        </p>
        <Link to="/directory">
          <Button variant="outline">Browse the directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="mx-auto w-full max-w-[820px] px-6 py-8 sm:px-10">
              <ResumeDocument data={toEditableFields(data)} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Public resume · read-only
        </p>
      </div>
    </div>
  );
};

export default PublicResume;
