import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const { user, isGuest } = useAuth();
  const location = useLocation();

  if (isGuest) {
    const next = encodeURIComponent(location.pathname + location.search);
    const msg = encodeURIComponent("Please log in to access admin pages.");
    return (
      <Navigate to={`/login?next=${next}&noGoogle=1&message=${msg}`} replace />
    );
  }

  // Check if user is admin (either isAdmin flag or has admin role)
  const role = user?.role?.toLowerCase() || "";
  const isAdmin =
    user?.isAdmin ||
    (user?.role &&
      [
        "superadmin",
        "system admin",
        "surveyadmin",
        "survey admin",
        "analyst",
        "report viewer",
        "support",
        "feedback manager",
      ].includes(role));

  if (!isAdmin) {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have access to this page.
      </div>
    );
  }

  // Authorized: render nested admin routes
  return <Outlet />;
}
