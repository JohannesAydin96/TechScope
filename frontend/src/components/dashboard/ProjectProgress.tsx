/**
 * Project progress component for the TechScope dashboard.
 *
 * Displays the project's completion percentage, progress bar,
 * and completed task count.
 */

type Props = {
  completionPercentage: number;
  completedTasks: number;
  totalTasks: number;
};

export default function ProjectProgress({
  completionPercentage,
  completedTasks,
  totalTasks,
}: Props) {
  return (
    <section className="progress-summary">
      <h2>Project Progress</h2>

      <p className="progress-percentage">
        {completionPercentage}%
      </p>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${completionPercentage}%`,
          }}
        />
      </div>

      <p>
        {completedTasks} of {totalTasks} tasks completed
      </p>
    </section>
  );
}