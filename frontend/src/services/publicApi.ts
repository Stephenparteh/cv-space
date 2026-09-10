import { request } from "./api";
import type { DirectoryEntry, PublicProfile, PublicResume } from "@/types/public";

/** GET /api/public/resumes/:slug — no auth. */
export function getPublicResume(slug: string, signal?: AbortSignal): Promise<{ resume: PublicResume }> {
  return request<{ resume: PublicResume }>(`/api/public/resumes/${encodeURIComponent(slug)}`, {
    signal,
  });
}

/** GET /api/public/profiles/:slug — no auth. */
export function getPublicProfile(
  slug: string,
  signal?: AbortSignal,
): Promise<{ profile: PublicProfile }> {
  return request<{ profile: PublicProfile }>(`/api/public/profiles/${encodeURIComponent(slug)}`, {
    signal,
  });
}

/** GET /api/public/directory?q=&skill= — no auth. */
export function getDirectory(
  params: { q?: string; skill?: string },
  signal?: AbortSignal,
): Promise<{ profiles: DirectoryEntry[] }> {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.skill?.trim()) query.set("skill", params.skill.trim());
  const qs = query.toString();
  return request<{ profiles: DirectoryEntry[] }>(`/api/public/directory${qs ? `?${qs}` : ""}`, {
    signal,
  });
}
