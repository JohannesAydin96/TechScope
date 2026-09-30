/**
 * Task creation form for TechScope.
 *
 * Handles task input, validation, labels, submission,
 * and dashboard refresh after a task is created.
 */

import { useState } from "react";

import { createTask } from "../services/taskService";
import { useDashboard } from "../context/DashboardContext";

import type { TaskPriority } from "../types/dashboard";

type Props = {
  projectId: number;
  onTaskCreated: () => void;
};

const SUGGESTED_LABEL_ROWS = [
  [
    "AI",
    "API",
    "Backend",
    "Bug",
    "Database",
    "Documentation",
    "Feature",
  ],
  [
    "Frontend",
    "Fullstack",
    "Git",
    "Testing",
    "UI",
    "Version",
  ],
];

export default function CreateTaskForm({
  projectId,
  onTaskCreated,
}: Props) {
  const { refreshDashboard } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] =
    useState<TaskPriority>("medium");

  const [dueDate, setDueDate] = useState("");

  const [selectedLabels, setSelectedLabels] =
    useState<string[]>([]);

  const [customLabels, setCustomLabels] = useState("");

  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  function toggleSuggestedLabel(label: string) {
    setSelectedLabels((currentLabels) => {
      const alreadySelected =
        currentLabels.includes(label);

      if (alreadySelected) {
        return currentLabels.filter(
          (currentLabel) => currentLabel !== label,
        );
      }

      return [...currentLabels, label];
    });
  }

  function buildLabels(): string[] {
    const customLabelList = customLabels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

    const combinedLabels = [
      ...selectedLabels,
      ...customLabelList,
    ];

    const uniqueLabels: string[] = [];

    combinedLabels.forEach((label) => {
      const alreadyExists = uniqueLabels.some(
        (existingLabel) =>
          existingLabel.toLowerCase() ===
          label.toLowerCase(),
      );

      if (!alreadyExists) {
        uniqueLabels.push(label);
      }
    });

    return uniqueLabels;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      await createTask(
        projectId,
        {
          title: trimmedTitle,
          description: trimmedDescription,
          priority,
          due_date: dueDate || null,
          labels: buildLabels(),
        },
      );

      await refreshDashboard();

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setSelectedLabels([]);
      setCustomLabels("");

      onTaskCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form
      className="create-task-form"
      onSubmit={handleSubmit}
    >
      <h2>Create Task</h2>

      {error && (
        <p
          className="auth-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <label htmlFor="task-title">
        Title
      </label>

      <input
        id="task-title"
        name="title"
        type="text"
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        required
        disabled={isCreating}
      />

      <label htmlFor="task-description">
        Description
      </label>

      <textarea
        id="task-description"
        name="description"
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
        disabled={isCreating}
      />

      <label htmlFor="task-priority">
        Priority
      </label>

      <select
        id="task-priority"
        name="priority"
        value={priority}
        onChange={(event) =>
          setPriority(event.target.value as TaskPriority)
        }
        disabled={isCreating}
      >
        <option value="low">Low</option>

        <option value="medium">Medium</option>

        <option value="high">High</option>
      </select>

      <label htmlFor="task-due-date">
        Due date
      </label>

      <input
        id="task-due-date"
        name="dueDate"
        type="date"
        value={dueDate}
        onChange={(event) =>
          setDueDate(event.target.value)
        }
        disabled={isCreating}
      />

      <div className="task-labels-field">
        <span className="task-labels-field-title">
          Labels
        </span>

        <p className="task-labels-help">
          Choose common labels or add your own.
        </p>

        <div className="task-label-suggestions">
          {SUGGESTED_LABEL_ROWS.map(
            (row, rowIndex) => (
              <div
                key={rowIndex}
                className="task-label-suggestion-row"
              >
                {row.map((label) => {
                  const isSelected =
                    selectedLabels.includes(label);

                  return (
                    <button
                      key={label}
                      type="button"
                      className={`task-label-suggestion task-label-suggestion-${label.toLowerCase()} ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleSuggestedLabel(label)
                      }
                      disabled={isCreating}
                      aria-pressed={isSelected}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ),
          )}
        </div>

        <label
          htmlFor="task-custom-labels"
          className="task-custom-labels-label"
        >
          Custom labels
        </label>

        <input
          id="task-custom-labels"
          name="customLabels"
          type="text"
          value={customLabels}
          onChange={(event) =>
            setCustomLabels(event.target.value)
          }
          placeholder="Add custom labels..."
          aria-describedby="task-custom-labels-help"
          disabled={isCreating}
        />

        <p
          id="task-custom-labels-help"
          className="task-labels-help"
        >
          Separate multiple custom labels with commas.
        </p>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || isCreating}
        aria-busy={isCreating}
      >
        {isCreating
          ? "Creating..."
          : "Create Task"}
      </button>
    </form>
  );
}