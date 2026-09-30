/**
 * Task breakdown component for the TechScope dashboard.
 *
 * Displays task distribution by status using percentages
 * and task counts for each status category.
 */

type Props = {
  todoPercentage: number;
  inProgressPercentage: number;
  completedPercentage: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
};

export default function TaskBreakdown({
  todoPercentage,
  inProgressPercentage,
  completedPercentage,
  todoTasks,
  inProgressTasks,
  completedTasks,
}: Props) {
  return (
    <section className="task-breakdown">
      <h2>Task Breakdown</h2>

      <div className="task-breakdown-grid">
        <div className="breakdown-card">
          <h3>Todo</h3>
          <p>{todoPercentage}%</p>
          <span>
            {todoTasks} {todoTasks === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div className="breakdown-card">
          <h3>In Progress</h3>
          <p>{inProgressPercentage}%</p>
          <span>
            {inProgressTasks}{" "}
            {inProgressTasks === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div className="breakdown-card">
          <h3>Completed</h3>
          <p>{completedPercentage}%</p>
          <span>
            {completedTasks}{" "}
            {completedTasks === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>
    </section>
  );
}