/**
 * Authentication service for the TechScope frontend.
 *
 * Handles login, registration, and retrieval of the
 * currently authenticated user through the API client.
 */

import { apiRequest } from "../api/client";

export type AuthTokenResponse = {
  access_token: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  created_at: string;
};

export async function login(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    },
    false,
  );
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<CurrentUser> {
  return apiRequest<CurrentUser>(
    "/register",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    },
    false,
  );
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/me");
}