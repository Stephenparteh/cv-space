import { request } from "./api";
import type { Resume, ResumeEditableFields } from "@/types/resume";

/** GET /api/resumes — all resumes owned by the authenticated user, newest first. */
export function listResumes(signal?: AbortSignal): Promise<{ resumes: Resume[] }> {
  return request<{ resumes: Resume[] }>("/api/resumes", { auth: true, signal });
}

/** GET /api/resumes/:id — the authenticated user's resume. */
export function getResume(id: string, signal?: AbortSignal): Promise<{ resume: Resume }> {
  return request<{ resume: Resume }>(`/api/resumes/${id}`, { auth: true, signal });
}

/**
 * POST /api/resumes — creates a resume owned by the authenticated user.
 * With no fields the backend fills MVP defaults (title "My Resume", classic
 * template, empty sections).
 */
export function createResume(
  fields?: Partial<ResumeEditableFields>,
): Promise<{ resume: Resume }> {
  return request<{ resume: Resume }>("/api/resumes", {
    method: "POST",
    auth: true,
    body: fields ?? {},
  });
}

/** PUT /api/resumes/:id — sends only editable fields (never id / ownerId / timestamps). */
export function updateResume(
  id: string,
  fields: ResumeEditableFields,
): Promise<{ resume: Resume }> {
  return request<{ resume: Resume }>(`/api/resumes/${id}`, {
    method: "PUT",
    auth: true,
    body: fields,
  });
}

/** DELETE /api/resumes/:id — owner-scoped on the backend. */
export function deleteResume(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/resumes/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/** PUT /api/resumes/:id/visibility — toggle public sharing (owner-scoped). */
export function setResumeVisibility(id: string, isPublic: boolean): Promise<{ resume: Resume }> {
  return request<{ resume: Resume }>(`/api/resumes/${id}/visibility`, {
    method: "PUT",
    auth: true,
    body: { isPublic },
  });
}
