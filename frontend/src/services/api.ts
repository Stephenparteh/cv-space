import { getToken } from "./authStorage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Error thrown for any non-2xx response or `{ success: false }` body. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach the stored Bearer token. */
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * Single place all authenticated JSON calls go through.
 * Unwraps the backend's `{ success, data }` envelope and returns `data`.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  const envelope = (payload ?? {}) as { success?: boolean; data?: T; error?: string };

  if (!res.ok || envelope.success === false) {
    const message =
      typeof envelope.error === "string" && envelope.error
        ? envelope.error
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return envelope.data as T;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  uptimeSeconds: number;
  timestamp: string;
  database: {
    status: "not_configured" | "connecting" | "connected" | "error";
    error: string | null;
  };
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}
