"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const TOKEN_KEY = "complaint_portal_token";
const USER_KEY = "complaint_portal_user";
const TOKEN_COOKIE = "complaint_portal_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setTokenCookie(token) {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  setTokenCookie(token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearTokenCookie();
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors || [];
  }
}

async function request(path, { method = "GET", body, auth = false, redirectOn401 = true } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Network error. Please check your connection and try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    // A 401 usually means the session is invalid/expired, so clear it and
    // bounce to login. Some flows treat 401 as a business result instead
    // (e.g. "current password is incorrect" on change-password) and opt out
    // with redirectOn401: false so the user's session stays intact.
    if (redirectOn401) {
      const hadToken = Boolean(getToken());
      clearToken();
      if (hadToken && typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new ApiError(
      401,
      payload?.message || "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message || "Request failed. Please try again.",
      payload?.errors
    );
  }

  return payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export function redirectByRole(role) {
  if (role === "IT_STAFF") return "/staff/queue";
  if (role === "ADMIN") return "/admin";
  return "/dashboard";
}
