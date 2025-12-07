import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import valenzuelaLogo from "../../assets/valenzuela-logo.png";
import { useAuth } from "../../context/AuthContext";

import {
  MdDashboard,
  MdAssignment,
  MdQuestionAnswer,
  MdBarChart,
  MdPerson,
  MdHelpOutline,
  MdSettings,
  MdArrowBack,
  MdMenu,
  MdClose,
  MdNotifications,
} from "react-icons/md";

const FAKE_ADMIN = {
  name: "Admin",
  email: "admin@example.com",
  avatarUrl: valenzuelaLogo,
};

const sidebarLinks = [
  {
    label: "Overview",
    route: "/admin/overview",
    icon: <MdDashboard size={22} />,
  },
  {
    label: "Surveys",
    route: "/admin/surveys",
    icon: <MdAssignment size={22} />,
  },
  {
    label: "Responses",
    route: "/admin/responses",
    icon: <MdQuestionAnswer size={22} />,
  },
  { label: "Reports", route: "/admin/reports", icon: <MdBarChart size={22} /> },
  {
    label: "Profile & Security",
    route: "/admin/profile",
    icon: <MdPerson size={22} />,
  },
  {
    label: "Help & Feedback",
    route: "/admin/help",
    icon: <MdHelpOutline size={22} />,
  },
  {
    label: "Notifications",
    route: "/admin/notifications",
    icon: <MdNotifications size={22} />,
  },
];

function AdminSidebar() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-based access control - check if user can access a route
  const canAccess = (route) => {
    // If no user, deny access
    if (!user) {
      return false;
    }

    // If user has isAdmin flag but no role, allow all (backward compatibility)
    if (user.isAdmin && !user.role) {
      return true;
    }

    if (!user.role) {
      return route === "/admin/overview";
    }

    const role = user.role.toLowerCase();

    // System Administrator (Super Admin) - Full access to everything
    if (role === "superadmin" || role === "system admin") {
      return true;
    }

    // Survey Administrator - Full access EXCEPT Profile & Security (role management)
    if (role === "surveyadmin" || role === "survey admin") {
      return route !== "/admin/profile"; // Can access everything except role management
    }

    // Analyst / Report Viewer - Read-only access to responses and reports
    if (role === "analyst" || role === "report viewer") {
      return ["/admin/overview", "/admin/reports"].includes(route);
    }

    // Support / Feedback Manager - Limited to Help & Feedback
    if (role === "support" || role === "feedback manager") {
      return ["/admin/overview", "/admin/help"].includes(route);
    }

    // Default: allow overview for any admin user
    return route === "/admin/overview";
  };

  // Show all links, but mark which ones are accessible
  const linksWithAccess = sidebarLinks.map((link) => ({
    ...link,
    hasAccess: canAccess(link.route),
  }));

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Sidebar - MODIFIED FOR STICKY BEHAVIOR */}
      <aside
        className={`
          // Use 'sticky' on desktop, 'fixed' on mobile (as before)
          fixed md:sticky 
          
          // Pin it to the top universally. This is CRITICAL for fixed/sticky stability.
          **top-0** // Mobile specific: take up full height vertically
          inset-y-0 left-0 
          
          // Desktop: Ensure it takes full viewport height when it sticks
          md:h-screen 

          // Common styles
          z-40 flex flex-col w-72 bg-blue-700 text-white transition-transform duration-300 ease-in-out 
          
          // Mobile open/close logic
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } 
        `}
      >
        {/* Logo and header */}
        <div className="flex items-center px-6 py-5 border-b border-blue-800 mb-2">
          <img
            src={valenzuelaLogo}
            alt="Valenzuela Logo"
            className="w-10 h-10 rounded-full border border-blue-300 mr-3"
          />
          <div>
            <div className="text-lg font-semibold text-white">
              Admin Dashboard
            </div>
            <div className="text-xs text-blue-100">
              {user?.email || "Admin"}
            </div>
          </div>
        </div>
        {/* Sidebar links */}
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {linksWithAccess.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-7 py-2 transition rounded-lg ${
                    pathname === item.route
                      ? "bg-blue-800 bg-opacity-90 border-l-4 border-white font-semibold"
                      : item.hasAccess
                      ? "hover:bg-blue-600 bg-opacity-70"
                      : "opacity-60 hover:bg-blue-600 bg-opacity-50 pointer-events-none"
                  } text-white`}
                >
                  <span className="mr-4 text-white">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Logout button */}
        <div className="mt-auto px-6 pb-6">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="
              flex items-center justify-center
              w-full
              px-4 py-2
              rounded
              bg-white text-blue-700
              font-semibold
              border border-blue-700
              shadow
              transition
              hover:bg-blue-50
              focus:outline-none
              focus:ring-2 focus:ring-blue-300
            "
          >
            <MdArrowBack size={22} className="mr-2 text-blue-700" />
            <span className="text-blue-700 text-center w-full">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default AdminSidebar;
