import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Where to send the user after they authenticate — see ClaimGuestResume. */
  next: string;
}

/**
 * Shown when a guest clicks a save-related action. Explains the benefit of an
 * account (never a silent failure, never a bare redirect) and offers a real
 * choice: register, log in, or keep working as a guest.
 */
export function SaveGuestResumeDialog({ open, onClose, next }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const registerHref = `/login?mode=register&next=${encodeURIComponent(next)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-guest-title"
        aria-describedby="save-guest-desc"
        tabIndex={-1}
        className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="save-guest-title" className="text-lg font-semibold">
            Want to save your resume?
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p id="save-guest-desc" className="mb-5 text-sm text-muted-foreground">
          Create a free account and you can come back anytime to edit this resume, publish it, and
          manage multiple resumes. It's free, and your resume so far won't be lost.
        </p>
        <div className="flex flex-col gap-2">
          <Link to={registerHref} onClick={onClose}>
            <Button className="w-full">Create free account</Button>
          </Link>
          <Link to={loginHref} onClick={onClose}>
            <Button variant="outline" className="w-full">
              Log in
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Continue as guest
          </Button>
        </div>
      </div>
    </div>
  );
}
