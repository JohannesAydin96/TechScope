/**
 * Dashboard service for the TechScope frontend.
 *
 * Retrieves project-specific dashboard data
 * through the shared API client.
 */

import { apiRequest } from "../api/client";
import type { ProjectDashboard } from "../types/dashboard";

export async function getProjectDashboard(
  projectId: number,
): Promise<ProjectDashboard> {
  return apiRequest<ProjectDashboard>(
    `/projects/${projectId}/dashboard`,
  );
}