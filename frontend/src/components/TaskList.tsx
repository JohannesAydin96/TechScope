/**
 * Task list component for TechScope.
 *
 * Displays project tasks with status, priority, labels, deadlines,
 * and actions for viewing, editing, deleting, and updating tasks.
 */

import type { Task } from "../services/taskService";
import type { TaskStatus } from "../types/dashboard";

type Props = {
  tasks: Task[];
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
};

function getLabelClass(label: string) {
  const normalizedLabel = label.toLowerCase();

  switch (normalizedLabel) {
    case "ai":
      return "task-label task-label-ai";

    case "api":
      return "task-label task-label-api";

    case "backend":
      return "task-label task-label-backend";

    case "bug":
      return "task-label task-label-bug";

    case "database":
      return "task-label task-label-database";

    case "documentation":
      return "task-label task-label-documentation";

    case "feature":
      return "task-label task-label-feature";

    case "frontend":
      return "task-label task-label-frontend";

    case "fullstack":
      return "task-label task-label-fullstack";

    case "git":
      return "task-label task-label-git";

    case "testing":
      return "task-label task-label-testing";

    case "ui":
    case "ux":
    case "ui/ux":
      return "task-label task-label-ui";

    case "version":
      return "task-label task-label-version";

    default:
      return "task-label task-label-default";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "todo":
      return "status-badge status-todo";
    case "in_progress":
      return "status-badge status-progress";
    case "completed":
      return "status-badge status-completed";
    default:
      return "status-badge";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "todo":
      return "Todo";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case "low":
      return "priority-badge priority-low";
    case "medium":
      return "priority-badge priority-medium";
    case "high":
      return "priority-badge priority-high";
    default:
      return "priority-badge";
  }
}

function formatPriority(priority: string) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return priority;
  }
}

function getDueDateStatus(
  dueDate: string,
  taskStatus: string,
) {
  if (taskStatus === "completed") {
    return "Completed";
  }

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffInMs = due.getTime() - today.getTime();
  const diffInDays =
    diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 0) return "Overdue";
  if (diffInDays === 0) return "Due Today";
  if (diffInDays <= 3) return "Due Soon";

  return "Future";
}

function getDueDateClass(
  dueDate: string,
  taskStatus: string,
) {
  const status = getDueDateStatus(
    dueDate,
    taskStatus,
  );

  switch (status) {
    case "Completed":
      return "due-date-badge due-completed";
    case "Overdue":
      return "due-date-badge due-overdue";
    case "Due Today":
      return "due-date-badge due-today";
    case "Due Soon":
      return "due-date-badge due-soon";
    case "Future":
      return "due-date-badge due-future";
    default:
      return "due-date-badge";
  }
}

function getTaskCardClass(task: Task) {
  if (!task.due_date) {
    return "task-card";
  }

  const dueStatus = getDueDateStatus(
    task.due_date,
    task.status,
  );

  switch (dueStatus) {
    case "Completed":
      return "task-card task-completed";
    case "Overdue":
      return "task-card task-overdue";
    case "Due Today":
      return "task-card task-due-today";
    case "Due Soon":
      return "task-card task-due-soon";
    default:
      return "task-card";
  }
}

export default function TaskList({
  tasks,
  onStatusChange,
  onDeleteTask,
  onEditTask,
  onViewTask,
}: Props) {
  if (tasks.length === 0) {
    return (
      <div className="task-empty-state">
        <h3>No tasks found</h3>
        <p>
          Try changing your search term, filter, or
          sorting option.
        </p>
      </div>
    );
  }

  return (
    <div
      className="task-list"
      role="list"
      aria-label="Tasks"
    >
      {tasks.map((task) => {
        const taskTitleId = `task-title-${task.id}`;

        return (
          <div
            key={task.id}
            className={getTaskCardClass(task)}
            role="listitem"
            aria-labelledby={taskTitleId}
          >
            <div className="task-card-header">
              <h3 id={taskTitleId}>
                {task.title}
              </h3>

              <div className="task-card-actions">
                <button
                  type="button"
                  className="view-task-btn"
                  onClick={() => onViewTask(task)}
                  aria-label={`View details for ${task.title}`}
                >
                  <span aria-hidden="true">👁 </span>
                  View Details
                </button>

                <button
                  type="button"
                  className="edit-task-btn"
                  onClick={() => onEditTask(task)}
                  aria-label={`Edit ${task.title}`}
                >
                  <span aria-hidden="true">✏️ </span>
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-task-btn"
                  onClick={() => onDeleteTask(task)}
                  aria-label={`Delete ${task.title}`}
                >
                  <span aria-hidden="true">🗑 </span>
                  Delete
                </button>
              </div>
            </div>

            <p>{task.description}</p>

            {task.labels.length > 0 && (
              <div
                className="task-labels"
                aria-label="Task labels"
              >
                {task.labels.map(
                  (label, index) => (
                    <span
                      key={`${task.id}-${label}-${index}`}
                      className={getLabelClass(label)}
                    >
                      {label}
                    </span>
                  ),
                )}
              </div>
            )}

            <div className="task-meta">
              <span
                className={getStatusClass(
                  task.status,
                )}
              >
                {formatStatus(task.status)}
              </span>

              <select
                value={task.status}
                onChange={(event) =>
                  onStatusChange(
                    task.id,
                    event.target.value as TaskStatus,
                  )
                }
                aria-label={`Change status for ${task.title}`}
              >
                <option value="todo">Todo</option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>

              <span
                className={getPriorityClass(
                  task.priority,
                )}
              >
                {formatPriority(task.priority)}
              </span>

              {task.due_date && (
                <span
                  className={getDueDateClass(
                    task.due_date,
                    task.status,
                  )}
                >
                  {getDueDateStatus(
                    task.due_date,
                    task.status,
                  )}
                  :{" "}
                  {task.due_date.split("T")[0]}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}