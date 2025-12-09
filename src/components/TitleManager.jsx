import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Map routes (or prefixes) to human-friendly page titles
const routeTitleMap = [
  {
    match: (p) => p === "/" || p === "/surveyform",
    title: "Survey Questionnaire",
  },
  { match: (p) => p.startsWith("/survey/edit"), title: "Edit Survey" },
  { match: (p) => p === "/aftersurvey", title: "Survey Complete" },
  { match: (p) => p === "/submissions", title: "My Submissions" },
  { match: (p) => p === "/login", title: "Login" },
  { match: (p) => p === "/register", title: "Register" },
  { match: (p) => p === "/forgot-password", title: "Forgot Password" },

  // Admin routes
  {
    match: (p) => p === "/admin/overview" || p === "/admin",
    title: "Admin Dashboard",
  },
  { match: (p) => p === "/admin/surveys", title: "Surveys" },
  { match: (p) => p.startsWith("/admin/responses"), title: "Survey Responses" },
  { match: (p) => p === "/admin/reports", title: "Reports" },
  { match: (p) => p === "/admin/profile", title: "Profile & Security" },
  { match: (p) => p === "/admin/help", title: "Help & Feedback" },
  { match: (p) => p === "/admin/notifications", title: "Notifications" },
];

const DEFAULT_PREFIX = "GoVoice";

function getTitleForPath(pathname) {
  for (const entry of routeTitleMap) {
    try {
      if (entry.match(pathname)) return entry.title;
    } catch (e) {
      // ignore match errors
    }
  }
  // Fallback: derive from path
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  // Capitalize last segment
  const last = parts[parts.length - 1].replace(/[-_]/g, " ");
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export default function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = getTitleForPath(pathname);
    if (pageTitle) {
      document.title = `${DEFAULT_PREFIX} - ${pageTitle}`;
    } else {
      document.title = DEFAULT_PREFIX;
    }
  }, [pathname]);

  return null;
}
