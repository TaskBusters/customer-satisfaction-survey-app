// Utility functions for role-based access control

export const canAccessPage = (userRole, allowedRoles) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  const allowed = allowedRoles.map((r) => r.toLowerCase().trim());
  return (
    allowed.includes(role) ||
    allowed.includes("superadmin") ||
    allowed.includes("system admin")
  );
};

export const canEditSurvey = (userRole) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  return (
    role === "superadmin" ||
    role === "system admin" ||
    role === "surveyadmin" ||
    role === "survey admin"
  );
};

export const canEditRoles = (userRole) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  return (
    role === "superadmin" ||
    role === "system admin" ||
    role === "system administrator"
  );
};

export const canViewReports = (userRole) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  return (
    role === "superadmin" ||
    role === "system admin" ||
    role === "surveyadmin" ||
    role === "survey admin" ||
    role === "analyst" ||
    role === "report viewer"
  );
};

export const canManageFeedback = (userRole) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  return (
    role === "superadmin" ||
    role === "system admin" ||
    role === "surveyadmin" ||
    role === "survey admin" ||
    role === "support" ||
    role === "feedback manager"
  );
};

export const canViewNotifications = (userRole) => {
  if (!userRole) return false;
  const role = (userRole || "").toLowerCase().trim();
  return (
    role === "superadmin" ||
    role === "system admin" ||
    role === "surveyadmin" ||
    role === "survey admin"
  );
};
