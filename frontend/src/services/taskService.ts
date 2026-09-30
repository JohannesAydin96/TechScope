/**
 * Task service for the TechScope frontend.
 *
 * Handles retrieval, creation, updates, and deletion
 * of tasks associated with projects.
 */

import { apiRequest } from "../api/client";

import type {
  TaskPriority,
  TaskStatus,
} from "../types/dashboard";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  labels: string[];
  created_at: string;
  project_id: number;
};

export type TaskCreate = {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date?: string | null;
  labels?: string[];
};

export type TaskUpdate = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  labels?: string[];
};

export async function getTasks(
  projectId: number,
): Promise<Task[]> {
  return apiRequest<Task[]>(
    `/projects/${projectId}/tasks`,
  );
}

export async function createTask(
  projectId: number,
  task: TaskCreate,
): Promise<Task> {
  return apiRequest<Task>(
    `/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(task),
    },
  );
}

export async function updateTask(
  projectId: number,
  taskId: number,
  updates: TaskUpdate,
): Promise<Task> {
  return apiRequest<Task>(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
  );
}

export async function deleteTask(
  projectId: number,
  taskId: number,
): Promise<void> {
  await apiRequest<void>(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );
}