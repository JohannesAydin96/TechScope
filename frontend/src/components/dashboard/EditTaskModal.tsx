/**
 * Edit task modal for TechScope.
 *
 * Provides controls for updating task details, priority, due date,
 * and suggested or custom labels.
 */

import { useState } from "react";
import type { FormEvent } from "react";

import type { TaskPriority } from "../../types/dashboard";

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

const SUGGESTED_LABELS = SUGGESTED_LABEL_ROWS.flat();

type Props = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  labels: string[];
  isSaving: boolean;
  hasChanges: boolean;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onDueDateChange: (value: string) => void;
  onLabelsChange: (labels: string[]) => void;

  onSubmit: (
    event: FormEvent,
  ) => void | Promise<void>;

  onClose: () => void;
};

function isSuggestedLabel(label: string) {
  return SUGGESTED_LABELS.some(
    (suggestedLabel) =>
      suggestedLabel.toLowerCase() ===
      label.toLowerCase(),
  );
}

function parseCustomLabels(value: string) {
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

function combineLabels(
  suggestedLabels: string[],
  customLabels: string[],
) {
  const combinedLabels = [
    ...suggestedLabels,
    ...customLabels,
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

export default function EditTaskModal({
  title,
  description,
  priority,
  dueDate,
  labels,
  isSaving,
  hasChanges,

  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onDueDateChange,
  onLabelsChange,
  onSubmit,
  onClose,
}: Props) {
  const [customLabels, setCustomLabels] = useState(() =>
    labels
      .filter((label) => !isSuggestedLabel(label))
      .join(", "),
  );

  function isLabelSelected(label: string) {
    return labels.some(
      (selectedLabel) =>
        selectedLabel.toLowerCase() ===
        label.toLowerCase(),
    );
  }

  function getSelectedSuggestedLabels() {
    return SUGGESTED_LABELS.filter((label) =>
      isLabelSelected(label),
    );
  }

  function toggleSuggestedLabel(label: string) {
    const selectedSuggestedLabels =
      getSelectedSuggestedLabels();

    const updatedSuggestedLabels = isLabelSelected(label)
      ? selectedSuggestedLabels.filter(
          (selectedLabel) => selectedLabel !== label,
        )
      : [...selectedSuggestedLabels, label];

    onLabelsChange(
      combineLabels(
        updatedSuggestedLabels,
        parseCustomLabels(customLabels),
      ),
    );
  }

  function handleCustomLabelsChange(value: string) {
    setCustomLabels(value);

    onLabelsChange(
      combineLabels(
        getSelectedSuggestedLabels(),
        parseCustomLabels(value),
      ),
    );
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close edit task"
          disabled={isSaving}
        >
          ×
        </button>

        <form
          className="edit-task-form"
          onSubmit={onSubmit}
        >
          <h2 id="edit-task-title">Edit Task</h2>

          <label htmlFor="edit-task-title-input">
            Title
          </label>

          <input
            id="edit-task-title-input"
            name="title"
            type="text"
            value={title}
            onChange={(event) =>
              onTitleChange(event.target.value)
            }
            required
            disabled={isSaving}
          />

          <label htmlFor="edit-task-description">
            Description
          </label>

          <textarea
            id="edit-task-description"
            name="description"
            value={description}
            onChange={(event) =>
              onDescriptionChange(event.target.value)
            }
            disabled={isSaving}
          />

          <label htmlFor="edit-task-priority">
            Priority
          </label>

          <select
            id="edit-task-priority"
            name="priority"
            value={priority}
            onChange={(event) =>
              onPriorityChange(
                event.target.value as TaskPriority,
              )
            }
            disabled={isSaving}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="edit-task-due-date">
            Due Date
          </label>

          <input
            id="edit-task-due-date"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) =>
              onDueDateChange(event.target.value)
            }
            disabled={isSaving}
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
                        isLabelSelected(label);

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
                          disabled={isSaving}
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
              htmlFor="edit-task-custom-labels"
              className="task-custom-labels-label"
            >
              Custom labels
            </label>

            <input
              id="edit-task-custom-labels"
              name="customLabels"
              type="text"
              value={customLabels}
              onChange={(event) =>
                handleCustomLabelsChange(
                  event.target.value,
                )
              }
              placeholder="Add custom labels..."
              disabled={isSaving}
              aria-describedby="edit-task-custom-labels-help"
            />

            <p
              id="edit-task-custom-labels-help"
              className="task-labels-help"
            >
              Separate multiple custom labels with commas.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              !title.trim() ||
              !hasChanges ||
              isSaving
            }
            aria-busy={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}