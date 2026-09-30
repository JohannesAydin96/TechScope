/**
 * Project deletion modal for TechScope.
 *
 * Handles deletion confirmation, submission state, and errors
 * when permanently deleting a project and its related data.
 */

import { useState } from "react";

import { deleteProject } from "../services/projectService";

import type { Project } from "../services/projectService";

type Props = {
  project: Project;
  onClose: () => void;
  onProjectDeleted: (projectId: number) => void;
};

export default function DeleteProjectModal({
  project,
  onClose,
  onProjectDeleted,
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

      await deleteProject(project.id);

      onProjectDeleted(project.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content delete-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close delete project modal"
          onClick={onClose}
          disabled={isDeleting}
        >
          ×
        </button>

        <h2 id="delete-project-title">
          Delete Project
        </h2>

        {error && (
          <p
            className="auth-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <p id="delete-project-description">
          Are you sure you want to delete{" "}
          <strong>{project.name}</strong>?
        </p>

        <p className="delete-project-warning">
          This action is permanent and will delete
          all tasks, comments, attachments, activity
          history and related notifications in this
          project.
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
              : "Delete Project"}
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