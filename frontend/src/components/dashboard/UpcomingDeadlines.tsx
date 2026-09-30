/**
 * Upcoming deadlines component for the TechScope dashboard.
 *
 * Identifies and displays active tasks with overdue,
 * due-today, or upcoming deadlines.
 */

import { useState } from "react";

import type { Task } from "../../services/taskService";

type Props = {
  tasks: Task[];
};

function getDeadlineStatus(dueDate: string) {
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

function getDeadlineStatusClass(dueDate: string) {
  const status = getDeadlineStatus(dueDate);

  switch (status) {
    case "Overdue":
      return "deadline-status deadline-overdue";

    case "Due Today":
      return "deadline-status deadline-today";

    case "Due Soon":
      return "deadline-status deadline-soon";

    default:
      return "deadline-status";
  }
}

function formatDeadlineDate(dueDate: string) {
  return dueDate.split("T")[0];
}

export default function UpcomingDeadlines({
  tasks,
}: Props) {
  const [showAllDeadlines, setShowAllDeadlines] =
    useState(false);

  const upcomingDeadlineTasks = tasks
    .filter((task) => {
      if (!task.due_date) {
        return false;
      }

      if (task.status === "completed") {
        return false;
      }

      const status = getDeadlineStatus(task.due_date);

      return (
        status === "Overdue" ||
        status === "Due Today" ||
        status === "Due Soon"
      );
    })
    .sort((firstTask, secondTask) => {
      if (
        !firstTask.due_date ||
        !secondTask.due_date
      ) {
        return 0;
      }

      return (
        new Date(firstTask.due_date).getTime() -
        new Date(secondTask.due_date).getTime()
      );
    });

  const visibleDeadlineTasks = showAllDeadlines
    ? upcomingDeadlineTasks
    : upcomingDeadlineTasks.slice(0, 5);

  return (
    <section className="upcoming-deadlines">
      <div className="upcoming-deadlines-header">
        <div>
          <h2>Upcoming Deadlines</h2>
          <p>Tasks that need attention soon</p>
        </div>

        <span>
          {upcomingDeadlineTasks.length} active
        </span>
      </div>

      {upcomingDeadlineTasks.length === 0 ? (
        <div className="upcoming-deadlines-empty">
          <p>No urgent deadlines right now.</p>
        </div>
      ) : (
        <>
          <div className="upcoming-deadlines-list">
            {visibleDeadlineTasks.map((task) => {
              const dueDate = task.due_date;

              if (!dueDate) {
                return null;
              }

              return (
                <div
                  key={task.id}
                  className="upcoming-deadline-item"
                >
                  <div>
                    <h3>{task.title}</h3>

                    <p>
                      {task.description ||
                        "No description"}
                    </p>
                  </div>

                  <span
                    className={getDeadlineStatusClass(
                      dueDate,
                    )}
                  >
                    {getDeadlineStatus(dueDate)} •{" "}
                    {formatDeadlineDate(dueDate)}
                  </span>
                </div>
              );
            })}
          </div>

          {upcomingDeadlineTasks.length > 5 && (
            <button
              type="button"
              className="upcoming-deadlines-toggle"
              onClick={() =>
                setShowAllDeadlines(
                  (currentValue) => !currentValue,
                )
              }
            >
              {showAllDeadlines
                ? "Show less"
                : `Show ${
                    upcomingDeadlineTasks.length - 5
                  } more task${
                    upcomingDeadlineTasks.length -
                      5 ===
                    1
                      ? ""
                      : "s"
                  }`}
            </button>
          )}
        </>
      )}
    </section>
  );
}