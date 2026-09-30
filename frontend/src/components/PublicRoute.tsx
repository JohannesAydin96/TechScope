/**
 * Public route wrapper for TechScope.
 *
 * Keeps authenticated users out of public routes
 * by redirecting them to the dashboard.
 */

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type PublicRouteProps = {
  children: ReactNode;
};

export default function PublicRoute({
  children,
}: PublicRouteProps) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}