/**
 * Header component for the TechScope dashboard.
 *
 * Displays the dashboard title and navigation bar
 * for the currently selected project.
 */

import Navbar from "../Navbar";

type Props = {
  selectedProjectId: number | null;
};

export default function DashboardHeader({
  selectedProjectId,
}: Props) {
  return (
    <div className="dashboard-topbar">
      <div className="dashboard-title">
        <h1>TechScope Dashboard</h1>

        <p>Project overview and task insights</p>
      </div>

      <Navbar selectedProjectId={selectedProjectId} />
    </div>
  );
}