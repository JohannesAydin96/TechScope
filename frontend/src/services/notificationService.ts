/**
 * Notification service for the TechScope frontend.
 *
 * Handles project-scoped notification retrieval, read states,
 * and deletion through the shared API client.
 */

import { apiRequest } from "../api/client";
import type { Notification } from "../types/notification";

const getNotifications = async (
  projectId: number,
): Promise<Notification[]> => {
  return apiRequest<Notification[]>(
    `/projects/${projectId}/notifications`,
  );
};

const getUnreadNotifications = async (
  projectId: number,
): Promise<Notification[]> => {
  return apiRequest<Notification[]>(
    `/projects/${projectId}/notifications/unread`,
  );
};

const markAsRead = async (
  projectId: number,
  notificationId: number,
): Promise<Notification> => {
  return apiRequest<Notification>(
    `/projects/${projectId}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );
};

type MarkAllNotificationsReadResponse = {
  message: string;
  updated_count: number;
};

const markAllAsRead = async (
  projectId: number,
): Promise<MarkAllNotificationsReadResponse> => {
  return apiRequest<MarkAllNotificationsReadResponse>(
    `/projects/${projectId}/notifications/read-all`,
    {
      method: "PATCH",
    },
  );
};

const deleteNotification = async (
  projectId: number,
  notificationId: number,
): Promise<void> => {
  await apiRequest<void>(
    `/projects/${projectId}/notifications/${notificationId}`,
    {
      method: "DELETE",
    },
  );
};

export const notificationService = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};