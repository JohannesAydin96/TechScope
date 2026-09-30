/**
 * Project creation form for TechScope.
 *
 * Handles project input, validation, submission,
 * and feedback while a new project is being created.
 */

import { useState } from "react";

import { createProject } from "../services/projectService";
import type { Project } from "../services/projectService";

type Props = {
  onProjectCreated: (project: Project) => void;
};

export default function CreateProjectForm({
  onProjectCreated,
}: Props) {
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const newProject = await createProject({
        name: trimmedName,
      });

      setName("");

      onProjectCreated(newProject);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="create-project-form"
      onSubmit={handleSubmit}
    >
      <h2>Create Project</h2>

      {error && (
        <p
          className="auth-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <label htmlFor="project-name">
        Project name
      </label>

      <input
        id="project-name"
        name="name"
        type="text"
        value={name}
        onChange={(event) =>
          setName(event.target.value)
        }
        autoComplete="off"
        required
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={!name.trim() || isSubmitting}
      >
        {isSubmitting
          ? "Creating..."
          : "Create Project"}
      </button>
    </form>
  );
}