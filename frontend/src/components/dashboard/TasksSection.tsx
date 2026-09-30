/**
 * Tasks section component for the TechScope dashboard.
 *
 * Handles task search, filtering, sorting, and displays
 * the resulting tasks through the task list.
 */

import { useState } from "react";
import type { RefObject } from "react";

import TaskList from "../TaskList";

import type { Task } from "../../services/taskService";
import type { TaskStatus } from "../../types/dashboard";

type Props = {
  tasks: Task[];
  taskListRef: RefObject<HTMLDivElement | null>;
  onStatusChange: (
    taskId: number,
    status: TaskStatus,
  ) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
};

export default function TasksSection({
  tasks,
  taskListRef,
  onStatusChange,
  onDeleteTask,
  onEditTask,
  onViewTask,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortOption, setSortOption] = useState("newest");

  const [searchTerm, setSearchTerm] = useState("");

  const [labelFilter, setLabelFilter] = useState("all");

  const normalizedSearchTerm =
    searchTerm.toLowerCase().trim();

  const availableLabels = Array.from(
    new Set(
      tasks.flatMap((task) => task.labels ?? []),
    ),
  ).sort();

  const searchedTasks =
    normalizedSearchTerm === ""
      ? tasks
      : tasks.filter((task) => {
          const title = task.title.toLowerCase();

          const description =
            task.description?.toLowerCase() ?? "";

          return (
            title.includes(normalizedSearchTerm) ||
            description.includes(normalizedSearchTerm)
          );
        });

  const statusFilteredTasks =
    statusFilter === "all"
      ? searchedTasks
      : searchedTasks.filter(
          (task) => task.status === statusFilter,
        );

  const labelFilteredTasks =
    labelFilter === "all"
      ? statusFilteredTasks
      : statusFilteredTasks.filter((task) =>
          task.labels?.includes(labelFilter),
        );

  const sortedTasks = [...labelFilteredTasks];

  switch (sortOption) {
    case "newest":
      sortedTasks.sort(
        (firstTask, secondTask) =>
          new Date(secondTask.created_at).getTime() -
          new Date(firstTask.created_at).getTime(),
      );
      break;

    case "oldest":
      sortedTasks.sort(
        (firstTask, secondTask) =>
          new Date(firstTask.created_at).getTime() -
          new Date(secondTask.created_at).getTime(),
      );
      break;

    case "priority": {
      const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
      };

      sortedTasks.sort(
        (firstTask, secondTask) =>
          priorityOrder[
            firstTask.priority as keyof typeof priorityOrder
          ] -
          priorityOrder[
            secondTask.priority as keyof typeof priorityOrder
          ],
      );
      break;
    }

    case "status":
      sortedTasks.sort(
        (firstTask, secondTask) =>
          firstTask.status.localeCompare(
            secondTask.status,
          ),
      );
      break;

    case "due_date":
      sortedTasks.sort((firstTask, secondTask) => {
        if (
          !firstTask.due_date &&
          !secondTask.due_date
        ) {
          return 0;
        }

        if (!firstTask.due_date) {
          return 1;
        }

        if (!secondTask.due_date) {
          return -1;
        }

        return (
          new Date(firstTask.due_date).getTime() -
          new Date(secondTask.due_date).getTime()
        );
      });
      break;

    default:
      break;
  }

  return (
    <div
      ref={taskListRef}
      className="tasks-section"
    >
      <div className="tasks-header-row">
        <div className="tasks-title-block">
          <h2>Tasks</h2>

          <p>
            {sortedTasks.length}{" "}
            {sortedTasks.length === 1 ? "task" : "tasks"} shown
          </p>
        </div>

        <div className="task-controls">
          <div className="task-search">
            <label htmlFor="task-search">
              Search
            </label>

            <div className="task-search-input-wrapper">
              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  aria-label="Clear task search"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="task-filters">
            <label htmlFor="status-filter">
              Status Filter
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All</option>

              <option value="todo">Todo</option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          <div className="task-filters">
            <label htmlFor="label-filter">
              Label Filter
            </label>

            <select
              id="label-filter"
              value={labelFilter}
              onChange={(event) =>
                setLabelFilter(event.target.value)
              }
            >
              <option value="all">All Labels</option>

              {availableLabels.map((label) => (
                <option
                  key={label}
                  value={label}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="task-sorting">
            <label htmlFor="task-sort">
              Sort By
            </label>

            <select
              id="task-sort"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value)
              }
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="priority">
                Priority
              </option>

              <option value="status">
                Status
              </option>

              <option value="due_date">
                Due Date
              </option>
            </select>
          </div>
        </div>
      </div>

      <TaskList
        tasks={sortedTasks}
        onStatusChange={onStatusChange}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
        onViewTask={onViewTask}
      />
    </div>
  );
}