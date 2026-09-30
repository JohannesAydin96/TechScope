/**
 * Task attachment service for the TechScope frontend.
 *
 * Handles retrieval, upload, deletion, and download
 * of files attached to project tasks.
 */

import { apiRequest, apiRequestBlob } from "../api/client";

export type TaskAttachment = {
  id: number;
  original_filename: string;
  content_type?: string | null;
  file_size: number;
  created_at: string;
  task_id: number;
  user_id: number;
};

export async function getTaskAttachments(
  projectId: number,
  taskId: number,
): Promise<TaskAttachment[]> {
  return apiRequest<TaskAttachment[]>(
    `/projects/${projectId}/tasks/${taskId}/attachments`,
  );
}

export async function uploadTaskAttachment(
  projectId: number,
  taskId: number,
  file: File,
): Promise<TaskAttachment> {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest<TaskAttachment>(
    `/projects/${projectId}/tasks/${taskId}/attachments`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function deleteTaskAttachment(
  projectId: number,
  taskId: number,
  attachmentId: number,
): Promise<void> {
  await apiRequest<void>(
    `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
    },
  );
}

export async function downloadTaskAttachment(
  projectId: number,
  taskId: number,
  attachmentId: number,
  filename: string,
): Promise<void> {
  const blob = await apiRequestBlob(
    `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`,
  );

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
}