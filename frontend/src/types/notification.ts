/**
 * Notification types for the TechScope frontend.
 *
 * Defines the data structure used for
 * project-scoped task notifications.
 */

export interface Notification {
  id: number;
  user_id: number;
  task_id: number | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}