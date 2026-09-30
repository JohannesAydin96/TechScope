/**
 * Project rename modal for TechScope.
 *
 * Handles project name editing, validation, submission,
 * and feedback while a project is being renamed.
 */

import { useState } from "react";

import { updateProject } from "../services/projectService";

import type { Project } from "../services/projectService";

type Props = {
  project: Project;
  onClose: () => void;
  onProjectRenamed: (project: Project) => void;
};

export default function RenameProjectModal({
  project,
  onClose,
  onProjectRenamed,
}: Props) {
  const [name, setName] = useState(project.name);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    if (trimmedName === project.name) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const updatedProject = await updateProject(
        project.id,
        {
          name: trimmedName,
        },
      );

      onProjectRenamed(updatedProject);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to rename project",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-project-title"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close rename project modal"
          onClick={onClose}
          disabled={isSaving}
        >
          ×
        </button>

        <form
          className="rename-project-form"
          onSubmit={handleSubmit}
        >
          <h2 id="rename-project-title">
            Rename Project
          </h2>

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <label htmlFor="rename-project-name">
            Project name
          </label>

          <input
            id="rename-project-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            autoComplete="off"
            required
            disabled={isSaving}
          />

          <div className="modal-actions">
            <button
              type="submit"
              disabled={
                !name.trim() ||
                name.trim() === project.name ||
                isSaving
              }
              aria-busy={isSaving}
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}