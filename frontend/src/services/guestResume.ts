import { toEditableFields, type ResumeEditableFields } from "@/types/resume";

/**
 * Guest résumé state lives ONLY in this browser's localStorage — it is never
 * sent to the server until the guest explicitly saves (registers or logs in),
 * at which point it is transferred once and cleared. See
 * `pages/ClaimGuestResume.tsx`. If the guest never saves, nothing about them
 * or their résumé is ever stored in the database.
 */
const STORAGE_KEY = "rb_guest_resume";

/** Reads the guest résumé, or null if none exists yet (storage unavailable counts as none). */
export function loadGuestResume(): ResumeEditableFields | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return toEditableFields(parsed as Parameters<typeof toEditableFields>[0]);
  } catch {
    return null;
  }
}

/** Persists the guest résumé's current editable state. */
export function saveGuestResume(fields: ResumeEditableFields): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch {
    /* storage disabled / full — the guest simply loses cross-refresh persistence */
  }
}

/** Clears guest résumé state — after a successful save/transfer, or "start new resume". */
export function clearGuestResume(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Whether guest résumé data currently exists in this browser. */
export function hasGuestResume(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
