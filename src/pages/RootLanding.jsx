import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SurveyPage from "./survey/SurveyPage";

export default function RootLanding() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is authenticated and should be routed to an admin area,
    // perform that redirect. Otherwise fall through to the public landing.
    if (!isGuest && user) {
      const role = (user.role || "").toLowerCase();
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

      if (isAdmin) {
        navigate("/admin", { replace: true });
        return;
      }

      // Add other role-based redirects here if needed in future
    }
  }, [isGuest, user, navigate]);

  // Default: show the public Survey landing page
  return <SurveyPage />;
}
