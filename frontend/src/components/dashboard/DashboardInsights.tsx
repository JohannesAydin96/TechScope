/**
 * Dashboard insights component for TechScope.
 *
 * Displays generated project insights in a dedicated
 * dashboard section.
 */

type Props = {
  insights: string[];
};

export default function DashboardInsights({
  insights,
}: Props) {
  return (
    <section className="dashboard-insights">
      <h2>Dashboard Insights</h2>

      <div className="dashboard-insights-card">
        {insights.map((insight, index) => (
          <p key={index}>💡 {insight}</p>
        ))}
      </div>
    </section>
  );
}