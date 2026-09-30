/**
 * Dashboard refresh hook for TechScope.
 *
 * Provides a reusable callback for triggering
 * dashboard data refreshes from frontend components.
 */

import { useCallback } from "react";

interface UseDashboardRefreshOptions {
  refreshDashboard: () => void | Promise<void>;
}

export function useDashboardRefresh({
  refreshDashboard,
}: UseDashboardRefreshOptions) {
  const triggerDashboardRefresh = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  return {
    triggerDashboardRefresh,
  };
}