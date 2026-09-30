/**
 * Task activity service for the TechScope frontend.
 *
 * Retrieves activity history for project tasks
 * through the shared API client.
 */

import { apiRequest } from "../api/client";

export type TaskActivity = {
  id: number;
  task_id: number;
  action: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
};

export async function getTaskActivities(
  projectId: number,
  taskId: number,
): Promise<TaskActivity[]> {
  return apiRequest<TaskActivity[]>(
    `/projects/${projectId}/tasks/${taskId}/activities`,
  );
}