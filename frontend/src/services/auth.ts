import { request } from "./api";
import { clearToken, setToken } from "./authStorage";
import { trackEvent } from "./analytics";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** POST /api/auth/login — stores the returned JWT on success. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const { user, token } = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(token);
  return user;
}

/** POST /api/auth/register — stores the returned JWT on success. */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user, token } = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  setToken(token);
  trackEvent("account_registered");
  return user;
}

/** GET /api/auth/me — resolves the current user from the stored token. */
export function getCurrentUser(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>("/api/auth/me", { auth: true });
}

/** Stateless JWT: logout is just discarding the client token. */
export function logout(): void {
  clearToken();
}
