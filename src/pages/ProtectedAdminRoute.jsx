import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const { user, isGuest } = useAuth();

  if (isGuest) return <Navigate to="/login" />;

  // Check if user is admin (either isAdmin flag or has admin role)
  const role = user?.role?.toLowerCase() || "";
  const isAdmin = user?.isAdmin || 
    (user?.role && [
      "superadmin", 
      "system admin",
      "surveyadmin", 
      "survey admin",
      "analyst", 
      "report viewer",
      "support", 
      "feedback manager"
    ].includes(role));

  if (!isAdmin) {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have access to this page.
      </div>
    );
  }

  return <AdminDashboard />;
}
