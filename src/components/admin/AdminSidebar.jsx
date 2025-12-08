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

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Role-based access control (unchanged) ---
  const canAccess = (route) => {
    if (!user) {
      return false;
    }
    if (user.isAdmin && !user.role) {
      return true;
    }
    if (!user.role) {
      return route === "/admin/overview";
    }

    const role = user.role.toLowerCase();

    if (role === "superadmin" || role === "system admin") {
      return true;
    }

    if (role === "surveyadmin" || role === "survey admin") {
      return route !== "/admin/profile";
    }

    if (role === "analyst" || role === "report viewer") {
      return ["/admin/overview", "/admin/reports"].includes(route);
    }

    if (role === "support" || role === "feedback manager") {
      return ["/admin/overview", "/admin/help"].includes(route);
    }

    return route === "/admin/overview";
  };

  const linksWithAccess = sidebarLinks.map((link) => ({
    ...link,
    hasAccess: canAccess(link.route),
  }));

  // Define dynamic width classes
  const sidebarWidthClass = isDesktopCollapsed ? "w-20" : "w-72";
  const contentHiddenClass = isDesktopCollapsed ? "hidden" : "block";

  return (
    <>
      {/* Mobile menu button (always visible, outside of the main sidebar for mobile overlay) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          // Sticky/Fixed behavior
          fixed md:sticky top-0 inset-y-0 left-0 
          md:h-screen 

          // Dynamic Width based on desktop state
          ${sidebarWidthClass}
          
          // Common styles
          z-40 flex flex-col bg-blue-700 text-white transition-all duration-300 ease-in-out 
          
          // Mobile open/close logic
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } 
        `}
      >
        {/* --- Top Header/Toggle Area --- */}
        <div
          // MODIFIED: Increased right padding (pr-6) when expanded, and adjusted justify when collapsed
          className={`flex items-center px-4 py-5 border-b border-blue-800 transition-all duration-300 ${
            isDesktopCollapsed ? "justify-center" : "pr-6"
          }`}
        >
          {/* Logo/Icon */}
          <img
            src={valenzuelaLogo}
            alt="Logo"
            // MODIFIED: Added mr-3 for spacing to the right of the logo when expanded
            className={`w-10 h-10 rounded-full border border-blue-300 shrink-0 ${
              isDesktopCollapsed ? "" : "mr-3"
            }`}
          />
          {/* Dashboard Title */}
          <div
            className={`overflow-hidden whitespace-nowrap flex-1 ${contentHiddenClass}`}
          >
            <div className="text-lg font-semibold text-white">
              Admin Dashboard
            </div>
            <div className="text-xs text-blue-100">
              {user?.email || "Admin"}
            </div>
          </div>

          {/* DESKTOP COLLAPSE BUTTON (Hamburger Menu) */}
          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            // MODIFIED: Increased padding (p-2) and ring size (ring-2) to make the circle bigger
            className={`hidden md:block shrink-0 p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 ring-2 ring-blue-500 ${
              isDesktopCollapsed
                ? "absolute top-5 right-[-14px] bg-blue-700"
                : "ml-2"
            }`}
            title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isDesktopCollapsed ? <MdMenu size={24} /> : <MdClose size={24} />}
          </button>
        </div>

        {/* Sidebar links */}
        <nav className="flex-1 overflow-y-auto mt-2">
          <ul>
            {linksWithAccess.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.route}
                  onClick={() => {
                    if (mobileMenuOpen) {
                      setMobileMenuOpen(false); // Close mobile menu if open
                    }
                  }}
                  className={`flex items-center py-2 transition rounded-lg mx-3 ${
                    pathname === item.route
                      ? "bg-blue-800 bg-opacity-90 border-l-4 border-white font-semibold"
                      : item.hasAccess
                      ? "hover:bg-blue-600 bg-opacity-70"
                      : "opacity-60 hover:bg-blue-600 bg-opacity-50 pointer-events-none"
                  } text-white ${
                    isDesktopCollapsed ? "justify-center px-0" : "px-4"
                  }`}
                  title={isDesktopCollapsed ? item.label : undefined} // Add tooltip on collapse
                >
                  {/* Icon remains visible in all states */}
                  <span
                    className={`text-white shrink-0 ${
                      isDesktopCollapsed ? "" : "mr-3"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label hides when collapsed */}
                  <span className={`whitespace-nowrap ${contentHiddenClass}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button Container */}
        <div className="px-3 pb-6 border-t border-blue-800 mt-auto pt-3">
          {/* Logout button */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className={`
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
                `}
            title={isDesktopCollapsed ? "Logout" : undefined}
          >
            {/* Icon remains visible */}
            <MdArrowBack
              size={22}
              className={`shrink-0 ${isDesktopCollapsed ? "" : "mr-2"}`}
            />

            {/* Text hides when collapsed */}
            <span
              className={`text-blue-700 text-center w-full ${contentHiddenClass}`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay (unchanged) */}
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
