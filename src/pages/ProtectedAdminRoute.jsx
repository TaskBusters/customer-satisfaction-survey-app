import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const { user, isGuest } = useAuth();

  if (isGuest) return <Navigate to="/login" />;

  // Accept either flag:
  if (!user.isAdmin && user.role !== "admin") {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have access to this page.
      </div>  
    );
  }

  return <AdminDashboard />;
}
