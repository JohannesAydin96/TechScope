/**
 * Project service for the TechScope frontend.
 *
 * Handles project retrieval, creation, updates, and deletion
 * through the shared API client.
 */

import { apiRequest } from "../api/client";

export type Project = {
  id: number;
  name: string;
  description: string | null;
  tech_stack: string | null;
  owner_id: number;
  created_at: string;
};

export type ProjectCreate = {
  name: string;
  description?: string | null;
  tech_stack?: string | null;
};

export type ProjectUpdate = {
  name?: string;
  description?: string | null;
  tech_stack?: string | null;
};

type MessageResponse = {
  message: string;
};

export async function getProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/projects");
}

export async function createProject(
  project: ProjectCreate,
): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function updateProject(
  projectId: number,
  project: ProjectUpdate,
): Promise<Project> {
  return apiRequest<Project>(
    `/projects/${projectId}`,
    {
      method: "PUT",
      body: JSON.stringify(project),
    },
  );
}

export async function deleteProject(
  projectId: number,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/projects/${projectId}`,
    {
      method: "DELETE",
    },
  );
}