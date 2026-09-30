/**
 * Shared API client for the TechScope frontend.
 *
 * Handles authenticated HTTP requests, response parsing,
 * API errors, and redirects when authentication expires.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

async function handleFailedResponse(
  response: Response,
  token: string | null,
  redirectOnUnauthorized: boolean,
): Promise<never> {
  const errorData = await response.json().catch(() => null);

  if (
    response.status === 401 &&
    redirectOnUnauthorized &&
    token
  ) {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  throw new Error(
    errorData?.detail || "API request failed",
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  redirectOnUnauthorized = true,
): Promise<T> {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...(isFormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    return handleFailedResponse(
      response,
      token,
      redirectOnUnauthorized,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {},
  redirectOnUnauthorized = true,
): Promise<Blob> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    return handleFailedResponse(
      response,
      token,
      redirectOnUnauthorized,
    );
  }

  return response.blob();
}