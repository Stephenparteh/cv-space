import { request } from "./api";
import type { MyProfile, MyProfileInput } from "@/types/public";

/** GET /api/profile — the authenticated user's profile, or null if none yet. */
export function getMyProfile(signal?: AbortSignal): Promise<{ profile: MyProfile | null }> {
  return request<{ profile: MyProfile | null }>("/api/profile", { auth: true, signal });
}

/** PUT /api/profile — create or update the authenticated user's profile. */
export function updateMyProfile(input: MyProfileInput): Promise<{ profile: MyProfile }> {
  return request<{ profile: MyProfile }>("/api/profile", {
    method: "PUT",
    auth: true,
    body: input,
  });
}
