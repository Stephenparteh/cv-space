import { request } from "./api";

export interface AdminStats {
  totals: {
    users: number;
    savedResumes: number;
    publicResumes: number;
    guestResumesStarted: number;
    guestResumesCompleted: number;
    pdfDownloads: number;
    accountRegistrations: number;
  };
  templateUsage: Record<string, number>;
  timeSeries: {
    days: number;
    users: Array<{ date: string; count: number }>;
    resumes: Array<{ date: string; count: number }>;
    guestActivity: Array<{ date: string; count: number }>;
    downloads: Array<{ date: string; count: number }>;
  };
}

export interface AdminActivity {
  recentUsers: Array<{ name: string; email: string; createdAt: string }>;
  recentResumes: Array<{
    title: string;
    template: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  recentEvents: Array<{ type: string; template: string | null; createdAt: string }>;
}

/** GET /api/admin/stats — admin only (server-enforced). */
export function getAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  return request<AdminStats>("/api/admin/stats", { auth: true, signal });
}

/** GET /api/admin/activity — admin only (server-enforced). */
export function getAdminActivity(signal?: AbortSignal): Promise<AdminActivity> {
  return request<AdminActivity>("/api/admin/activity", { auth: true, signal });
}
