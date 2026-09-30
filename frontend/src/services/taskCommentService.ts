/**
 * Task comment service for the TechScope frontend.
 *
 * Handles retrieval, creation, updates, and deletion
 * of comments associated with project tasks.
 */

import { apiRequest } from "../api/client";

export type TaskComment = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  task_id: number;
  user_id: number;
  username: string;
};

export type TaskCommentCreate = {
  content: string;
};

export async function getTaskComments(
  projectId: number,
  taskId: number,
): Promise<TaskComment[]> {
  return apiRequest<TaskComment[]>(
    `/projects/${projectId}/tasks/${taskId}/comments`,
  );
}

export async function createTaskComment(
  projectId: number,
  taskId: number,
  comment: TaskCommentCreate,
): Promise<TaskComment> {
  return apiRequest<TaskComment>(
    `/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(comment),
    },
  );
}

export async function updateTaskComment(
  projectId: number,
  taskId: number,
  commentId: number,
  content: string,
): Promise<TaskComment> {
  return apiRequest<TaskComment>(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    },
  );
}

export async function deleteTaskComment(
  projectId: number,
  taskId: number,
  commentId: number,
): Promise<void> {
  await apiRequest<void>(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    {
      method: "DELETE",
    },
  );
}