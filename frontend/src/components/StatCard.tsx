/**
 * Reusable statistics card for TechScope.
 *
 * Displays a labeled numeric metric within
 * dashboard statistics sections.
 */

import { useId } from "react";

type StatCardProps = {
  title: string;
  value: number;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  const headingId = useId();

  return (
    <article
      className="stat-card"
      aria-labelledby={headingId}
    >
      <h3 id={headingId}>{title}</h3>

      <p>{value}</p>
    </article>
  );
}