import { authStorage } from "@/lib/auth";

const DEFAULT_BASE_URL = "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
  return url.replace(/\/$/, "");
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register")) return;
  window.location.href = "/login";
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
};

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(res.status, "Réponse serveur invalide");
  }
}

function unwrapPayload<T>(data: ApiEnvelope<T> & T): T {
  if (data && typeof data === "object" && "success" in data && data.success === true && "data" in data) {
    return data.data as T;
  }
  return data as T;
}

async function request<T>(method: string, path: string, body?: unknown, withAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (withAuth) {
    const token = authStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_API === "true") {
      console.log(`[api] ${method} ${path} — token:`, token ? "présent" : "ABSENT");
    }
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const raw = await parseBody<ApiEnvelope<T> & T>(res);

  if (res.status === 401) {
    authStorage.removeToken();
    authStorage.removeUser();
    redirectToLogin();
    const message = raw.message ?? raw.error ?? "Session expirée";
    throw new ApiError(401, message, raw.code);
  }

  if (!res.ok) {
    const message = raw.message ?? raw.error ?? `Erreur HTTP ${res.status}`;
    throw new ApiError(res.status, message, raw.code);
  }

  return unwrapPayload(raw);
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body: unknown, withAuth = true) => request<T>("POST", url, body, withAuth),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string, body?: unknown) =>
    body !== undefined ? request<T>("DELETE", url, body) : request<T>("DELETE", url),
};
