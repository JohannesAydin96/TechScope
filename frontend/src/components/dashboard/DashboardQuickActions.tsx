/**
 * Quick actions component for the TechScope dashboard.
 *
 * Provides shortcuts for creating tasks, viewing tasks,
 * and navigating to recent tasks.
 */

type Props = {
  onCreateTask: () => void;
  onViewTasks: () => void;
  onRecentTasks: () => void;
};

export default function DashboardQuickActions({
  onCreateTask,
  onViewTasks,
  onRecentTasks,
}: Props) {
  return (
    <div className="quick-actions">
      <button type="button" onClick={onCreateTask}>
        Create Task
      </button>

      <button type="button" onClick={onViewTasks}>
        View Tasks
      </button>

      <button type="button" onClick={onRecentTasks}>
        Recent Tasks
      </button>
    </div>
  );
}