/**
 * Recent tasks component for TechScope.
 *
 * Displays a collapsible overview of recent tasks with
 * status, priority, labels, and deadline information.
 */

import { useId, useState } from "react";
import type { Task } from "../services/taskService";

type RecentTasksProps = {
  tasks: Task[];
  defaultOpen?: boolean;
  hideHeader?: boolean;
  onViewAllTasks?: () => void;
};

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

function getLabelClass(label: string) {
  switch (label.toLowerCase()) {
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

  if (diffInDays < 0) {
    return "Overdue";
  }

  if (diffInDays === 0) {
    return "Due Today";
  }

  if (diffInDays <= 3) {
    return "Due Soon";
  }

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

export default function RecentTasks({
  tasks,
  defaultOpen = false,
  hideHeader = false,
  onViewAllTasks,
}: RecentTasksProps) {
  const contentId = useId();

  const [isOpen, setIsOpen] = useState(
    hideHeader || defaultOpen,
  );

  return (
    <section
      className="dashboard-section recent-tasks-section"
      aria-labelledby={
        hideHeader
          ? undefined
          : `${contentId}-heading`
      }
      aria-label={
        hideHeader
          ? "Recent tasks"
          : undefined
      }
    >
      {!hideHeader && (
        <div className="recent-tasks-header">
          <div>
            <h2 id={`${contentId}-heading`}>
              Recent Tasks
            </h2>

            <p>Your latest tasks at a glance</p>
          </div>

          <button
            type="button"
            className="recent-tasks-toggle"
            onClick={() =>
              setIsOpen(
                (currentValue) => !currentValue,
              )
            }
            aria-expanded={isOpen}
            aria-controls={contentId}
          >
            {isOpen ? "Hide" : "Show"}
          </button>
        </div>
      )}

      {isOpen && (
        <div id={contentId}>
          {tasks.length === 0 ? (
            <p
              className="recent-tasks-empty"
              role="status"
            >
              No recent tasks found.
            </p>
          ) : (
            <>
              <div
                className="task-list recent-tasks-list"
                role="list"
                aria-label="Most recent tasks"
              >
                {tasks.map((task) => {
                  const taskTitleId =
                    `${contentId}-task-${task.id}`;

                  return (
                    <div
                      key={task.id}
                      className="task-item recent-task-item"
                      role="listitem"
                      aria-labelledby={taskTitleId}
                    >
                      <h3 id={taskTitleId}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="recent-task-description">
                          {task.description}
                        </p>
                      )}

                      <div className="task-meta recent-task-meta">
                        <span
                          className={getStatusClass(
                            task.status,
                          )}
                        >
                          {formatStatus(task.status)}
                        </span>

                        <span
                          className={getPriorityClass(
                            task.priority,
                          )}
                        >
                          {formatPriority(task.priority)}
                        </span>
                      </div>

                      {task.labels.length > 0 && (
                        <div
                          className="task-labels recent-task-labels"
                          aria-label="Task labels"
                        >
                          {task.labels.map(
                            (label, index) => (
                              <span
                                key={`${task.id}-${label}-${index}`}
                                className={getLabelClass(
                                  label,
                                )}
                              >
                                {label}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                      {task.due_date && (
                        <div className="recent-task-due-date">
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {onViewAllTasks && (
                <div className="recent-tasks-footer">
                  <button
                    type="button"
                    className="recent-tasks-view-all"
                    onClick={onViewAllTasks}
                  >
                    View all tasks
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}