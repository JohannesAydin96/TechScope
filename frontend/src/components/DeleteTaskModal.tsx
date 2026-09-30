/**
 * Task deletion modal for TechScope.
 *
 * Handles deletion confirmation, submission state, and errors
 * when permanently deleting a task and its related data.
 */

import { useState } from "react";

import { deleteTask } from "../services/taskService";
import type { Task } from "../services/taskService";

type Props = {
  projectId: number;
  task: Task;
  onClose: () => void;
  onTaskDeleted: (taskId: number) => void;
};

export default function DeleteTaskModal({
  projectId,
  task,
  onClose,
  onTaskDeleted,
}: Props) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      await deleteTask(projectId, task.id);

      onTaskDeleted(task.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content delete-task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        aria-describedby="delete-task-description"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close delete task modal"
          onClick={onClose}
          disabled={isDeleting}
        >
          ×
        </button>

        <h2 id="delete-task-title">
          Delete Task
        </h2>

        {error && (
          <p
            className="auth-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <p id="delete-task-description">
          Are you sure you want to delete{" "}
          <strong>{task.title}</strong>?
        </p>

        <p className="delete-task-warning">
          This action is permanent and will also
          delete this task&apos;s comments,
          attachments, activity history and related
          notifications.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Task"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}