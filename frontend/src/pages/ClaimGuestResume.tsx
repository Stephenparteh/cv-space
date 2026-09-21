import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { createResume } from "@/services/resumeApi";
import { trackEvent } from "@/services/analytics";
import { clearGuestResume, loadGuestResume } from "@/services/guestResume";

type Status = "working" | "error" | "done";

/**
 * Reached via `next=` after a guest registers or logs in from the "Save your
 * resume" prompt. Transfers the browser-local guest résumé into the newly
 * authenticated account exactly once, then clears local guest state.
 *
 * If there's no guest résumé to claim (nothing saved locally, or it was
 * already claimed), this just continues on to the dashboard — safe to land
 * on repeatedly, and safe if reached without ever having used the guest
 * builder at all.
 */
const ClaimGuestResume = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("working");
  const [message, setMessage] = useState("");
  const inFlightRef = useRef(false);

  const attemptClaim = useCallback(() => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus("working");

    if (!hasToken()) {
      // Shouldn't normally happen (this route is only linked to post-auth),
      // but fail safely rather than losing the guest data.
      navigate("/login?next=%2Fresumes%2Fclaim-guest", { replace: true });
      return;
    }

    const guest = loadGuestResume();
    if (!guest) {
      navigate("/dashboard", { replace: true });
      return;
    }

    createResume(guest)
      .then(({ resume }) => {
        clearGuestResume();
        trackEvent("resume_saved");
        setStatus("done");
        navigate(`/resumes/${resume.id}/edit`, { replace: true });
      })
      .catch((err: unknown) => {
        // Do NOT clear guest storage on failure — the user can retry, and
        // nothing is lost in the meantime.
        setMessage(
          err instanceof ApiError
            ? err.message
            : "Something went wrong while saving your resume.",
        );
        setStatus("error");
        inFlightRef.current = false;
      });
  }, [navigate]);

  useEffect(() => {
    // Intentionally run once on mount; `attemptClaim` guards re-entry itself.
    attemptClaim();
  }, [attemptClaim]);

  if (status === "error") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <h1 className="text-xl font-semibold">Couldn’t save your resume</h1>
        <p className="max-w-md text-muted-foreground">{message}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Your resume is still safe in this browser — nothing was lost.
        </p>
        <div className="flex gap-2">
          <Button onClick={attemptClaim}>Try again</Button>
          <Link to="/dashboard">
            <Button variant="ghost">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Saving your resume to your account…</p>
    </div>
  );
};

export default ClaimGuestResume;
