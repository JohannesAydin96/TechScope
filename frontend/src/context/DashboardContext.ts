/**
 * Dashboard context for TechScope.
 *
 * Defines the shared dashboard state contract and provides
 * the hook used to access dashboard context values.
 */

import {
  createContext,
  useContext,
} from "react";

import type { Task } from "../services/taskService";
import type { ProjectDashboard } from "../types/dashboard";

export interface DashboardContextValue {
  selectedProjectId: number | null;
  setSelectedProjectId: (
    projectId: number | null,
  ) => void;

  dashboard: ProjectDashboard | null;
  tasks: Task[];

  loading: boolean;
  error: string;

  refreshDashboard: () => Promise<void>;
}

export const DashboardContext =
  createContext<DashboardContextValue | undefined>(
    undefined,
  );

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (context === undefined) {
    throw new Error(
      "useDashboard must be used inside DashboardProvider",
    );
  }

  return context;
}