import { API_BASE_URL } from "./api";
import { getToken } from "./authStorage";

/**
 * Minimal anonymous/aggregate usage events. Never send resume content, names,
 * emails, or any personal data here — see backend/src/models/AnalyticsEvent.ts
 * for the exact allowlisted shape the server accepts.
 */
export type AnalyticsEventType =
  | "resume_started"
  | "resume_completed"
  | "resume_downloaded"
  | "account_registered"
  | "resume_saved"
  | "template_selected";

/**
 * Fire-and-forget usage event. Never throws, never blocks the caller, and
 * never surfaces an error to the user — analytics must not affect the
 * product experience. Attaches the current auth token when present so the
 * backend can (optionally) associate the event with a user; anonymous
 * (guest) callers simply omit it.
 */
export function trackEvent(type: AnalyticsEventType, meta?: { template?: string }): void {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    void fetch(`${API_BASE_URL}/api/analytics/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({ type, ...meta }),
      keepalive: true,
    }).catch(() => {
      /* analytics is best-effort only */
    });
  } catch {
    /* ignore — e.g. fetch unavailable in an unusual environment */
  }
}
