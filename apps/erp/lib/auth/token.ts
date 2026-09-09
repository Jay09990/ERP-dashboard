import { jwtDecode } from "jwt-decode";


const TOKEN_KEY = "altrex_token";
// Non-sensitive marker cookie — NOT the token itself — purely so Edge Middleware
// can still do a fast "probably logged in" redirect without access to localStorage.
const MARKER_COOKIE = "altrex_auth";

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // SSR-safe guard
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  // Marker only — short-lived, non-httpOnly is fine since it carries no secret.
  document.cookie = `${MARKER_COOKIE}=1; path=/; max-age=900; SameSite=Lax`;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${MARKER_COOKIE}=; path=/; max-age=0`;
}

/** Decodes the JWT payload without verifying it — client-side use only,
 *  for UX checks like "is this token already expired" before even firing a request.
 *  Never trust this for actual authorization; that's the backend's job. */
export function decodeTokenPayload(token: string): { exp?: number; [k: string]: unknown } | null {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}