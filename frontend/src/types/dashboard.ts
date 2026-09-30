/**
 * Dashboard types for the TechScope frontend.
 *
 * Defines shared task status, priority, task,
 * and project dashboard data structures.
 */

export type TaskStatus = "todo" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  project_id: number;
  labels: string[];
}

export interface ProjectDashboard {
  project_id: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  high_priority_tasks: number;
  recent_tasks: Task[];
}