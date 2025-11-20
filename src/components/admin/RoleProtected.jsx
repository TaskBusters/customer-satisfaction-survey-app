import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleProtected({ children, allowedRoles = [] }) {
  const { user, isGuest } = useAuth();

  if (isGuest) return <Navigate to="/login" />;

  if (!user) {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have access to this page.
      </div>
    );
  }

  // If no role but has isAdmin flag, allow (backward compatibility)
  if (!user.role && user.isAdmin) {
    return <>{children}</>;
  }

  if (!user.role) {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have access to this page.
      </div>
    );
  }

  const userRole = user.role.toLowerCase();
  
  // Map role variations
  const roleMap = {
    "superadmin": ["superadmin", "system admin"],
    "surveyadmin": ["surveyadmin", "survey admin"],
    "analyst": ["analyst", "report viewer"],
    "support": ["support", "feedback manager"]
  };

  // Check if user role matches any allowed role (including variations)
  const hasAccess = allowedRoles.length === 0 || allowedRoles.some(allowedRole => {
    const allowed = allowedRole.toLowerCase();
    const variations = roleMap[allowed] || [allowed];
    return variations.some(v => v === userRole);
  });

  if (!hasAccess) {
    return (
      <div className="p-10 text-red-600 text-center font-bold">
        You do not have permission to access this page. Required role: {allowedRoles.join(" or ")}
      </div>
    );
  }

  return <>{children}</>;
}

