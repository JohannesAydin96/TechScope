/**
 * Dashboard provider for TechScope.
 *
 * Manages shared project selection, dashboard data, tasks,
 * loading state, errors, and dashboard refresh functionality.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  DashboardContext,
  type DashboardContextValue,
} from "./DashboardContext";

import { getProjectDashboard } from "../services/dashboardService";
import { getTasks } from "../services/taskService";

import type { Task } from "../services/taskService";
import type { ProjectDashboard } from "../types/dashboard";

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({
  children,
}: DashboardProviderProps) {
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [dashboard, setDashboard] =
    useState<ProjectDashboard | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const latestRequestId = useRef(0);

  const refreshDashboard = useCallback(async () => {
    const requestId = ++latestRequestId.current;

    if (selectedProjectId === null) {
      setDashboard(null);
      setTasks([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [dashboardData, taskData] =
        await Promise.all([
          getProjectDashboard(selectedProjectId),
          getTasks(selectedProjectId),
        ]);

      if (requestId !== latestRequestId.current) {
        return;
      }

      setDashboard(dashboardData);
      setTasks(taskData);
    } catch (error) {
      if (requestId !== latestRequestId.current) {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard",
      );
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId === null) {
      return;
    }

    const projectId = selectedProjectId;
    const requestId = ++latestRequestId.current;
    let cancelled = false;

    async function loadSelectedProject() {
      try {
        const [dashboardData, taskData] =
          await Promise.all([
            getProjectDashboard(projectId),
            getTasks(projectId),
          ]);

        if (
          cancelled ||
          requestId !== latestRequestId.current
        ) {
          return;
        }

        setDashboard(dashboardData);
        setTasks(taskData);
        setError("");
      } catch (error) {
        if (
          cancelled ||
          requestId !== latestRequestId.current
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
        );
      } finally {
        if (
          !cancelled &&
          requestId === latestRequestId.current
        ) {
          setLoading(false);
        }
      }
    }

    void loadSelectedProject();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      selectedProjectId,
      setSelectedProjectId,
      dashboard,
      tasks,
      loading,
      error,
      refreshDashboard,
    }),
    [
      selectedProjectId,
      dashboard,
      tasks,
      loading,
      error,
      refreshDashboard,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}