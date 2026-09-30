/**
 * Project management component for the TechScope dashboard.
 *
 * Provides project selection and controls for creating,
 * renaming, and deleting projects.
 */

import type { Project } from "../../services/projectService";

type Props = {
  projects: Project[];
  selectedProjectId: number | null;
  hasSelectedProject: boolean;
  onProjectChange: (projectId: number) => void;
  onCreateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
};

export default function ProjectManagement({
  projects,
  selectedProjectId,
  hasSelectedProject,
  onProjectChange,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: Props) {
  return (
    <div className="project-management">
      <div className="project-selector">
        <label htmlFor="project-select">
          Select project
        </label>

        <select
          id="project-select"
          value={selectedProjectId ?? ""}
          onChange={(event) =>
            onProjectChange(Number(event.target.value))
          }
        >
          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="project-actions">
        <button type="button" onClick={onCreateProject}>
          Create Project
        </button>

        <button
          type="button"
          onClick={onRenameProject}
          disabled={!hasSelectedProject}
        >
          Rename
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={onDeleteProject}
          disabled={!hasSelectedProject}
        >
          Delete
        </button>
      </div>
    </div>
  );
}