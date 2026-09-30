/**
 * Statistics component for the TechScope dashboard.
 *
 * Displays key task metrics using reusable statistic cards,
 * including priority, completion, and deadline information.
 */

import StatCard from "../StatCard";

type Props = {
  totalTasks: number;
  highPriorityTasks: number;
  todoTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  dueSoonTasks: number;
};

export default function DashboardStats({
  totalTasks,
  highPriorityTasks,
  todoTasks,
  completedTasks,
  overdueTasks,
  dueTodayTasks,
  dueSoonTasks,
}: Props) {
  return (
    <section className="stats-grid">
      <StatCard title="Total Tasks" value={totalTasks} />

      <StatCard
        title="High Priority"
        value={highPriorityTasks}
      />

      <StatCard title="Todo" value={todoTasks} />

      <StatCard title="Completed" value={completedTasks} />

      <StatCard title="Overdue" value={overdueTasks} />

      <StatCard title="Due Today" value={dueTodayTasks} />

      <StatCard title="Due Soon" value={dueSoonTasks} />
    </section>
  );
}