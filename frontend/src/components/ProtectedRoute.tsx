/**
 * Protected route wrapper for TechScope.
 *
 * Restricts authenticated routes by redirecting users
 * without an authentication token to the login page.
 */

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}