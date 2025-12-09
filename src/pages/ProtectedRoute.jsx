import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isGuest } = useAuth();
  const location = useLocation();

  if (isGuest) {
    // Preserve the attempted path and disable Google auto-init on login page
    const next = encodeURIComponent(location.pathname + location.search);
    const msg = encodeURIComponent("Please log in to access this page.");
    return (
      <Navigate to={`/login?next=${next}&noGoogle=1&message=${msg}`} replace />
    );
  }

  return <>{children}</>;
}
