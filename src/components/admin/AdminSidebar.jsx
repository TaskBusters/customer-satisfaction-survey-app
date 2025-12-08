import React, { useState, useEffect } from "react";
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
  MdExitToApp,
  MdMenu,
  MdClose,
  MdNotifications,
} from "react-icons/md";

// --- Custom Hook to Persist State ---
const useStickyCollapse = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      // Return stored value if found, otherwise return default value
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return defaultValue;
    }
  });

  // Effect to write state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, state]);

  return [state, setState];
};
// ------------------------------------

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

  // MODIFIED: Use the custom hook to persist collapse state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useStickyCollapse(
    "sidebarCollapse",
    true
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/login");
  };

  const canAccess = (route) => {
    if (!user) return false;
    if (user.isAdmin && !user.role) return true;
    if (!user.role) return route === "/admin/overview";

    const role = user.role.toLowerCase();

    if (role === "superadmin" || role === "system admin") return true;

    if (role === "surveyadmin" || role === "survey admin")
      return route !== "/admin/profile";

    if (role === "analyst" || role === "report viewer")
      return ["/admin/overview", "/admin/reports"].includes(route);

    if (role === "support" || role === "feedback manager")
      return ["/admin/overview", "/admin/help"].includes(route);

    return route === "/admin/overview";
  };

  const linksWithAccess = sidebarLinks.map((link) => ({
    ...link,
    hasAccess: canAccess(link.route),
  }));

  const sidebarWidthClass = isDesktopCollapsed ? "w-20" : "w-72";
  const contentHiddenClass = isDesktopCollapsed ? "hidden" : "block";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-6 left-6 z-50 p-2 bg-blue-700 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 inset-y-0 left-0 
          md:h-screen 
          ${sidebarWidthClass}
          z-40 flex flex-col bg-blue-700 text-white transition-all duration-300 ease-in-out
          overflow-x-hidden 
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* --- Top Header/Toggle Area --- */}
        <div
          className={`flex items-center py-5 border-b border-blue-800 transition-all duration-300 ${
            isDesktopCollapsed ? "justify-center px-0" : "px-4 pr-6"
          }`}
        >
          {/* Logo and Dashboard Text - Only visible when NOT collapsed */}
          {!isDesktopCollapsed && (
            <>
              <img
                src={valenzuelaLogo}
                alt="Logo"
                className="w-10 h-10 rounded-full border border-blue-300 shrink-0 mr-3"
              />
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <div className="text-lg font-semibold text-white">
                  Admin Dashboard
                </div>
                <div className="text-xs text-blue-100">
                  {user?.email || "Admin"}
                </div>
              </div>
            </>
          )}

          {/* DESKTOP COLLAPSE BUTTON */}
          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className={`hidden md:flex items-center justify-center shrink-0 p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 ring-2 ring-blue-500 
            ${isDesktopCollapsed ? "bg-blue-700 mx-auto" : "ml-2"}`}
            title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isDesktopCollapsed ? <MdMenu size={24} /> : <MdClose size={24} />}
          </button>
        </div>

        {/* SCROLL AREA */}
        <nav className="flex-1 overflow-y-auto mt-2 no-scrollbar">
          <ul>
            {linksWithAccess.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.route}
                  onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
                  className={`flex items-center py-2 transition rounded-lg mx-3 ${
                    pathname === item.route
                      ? "bg-blue-800 bg-opacity-90 border-l-4 border-white font-semibold"
                      : item.hasAccess
                      ? "hover:bg-blue-600 bg-opacity-70"
                      : "opacity-60 hover:bg-blue-600 bg-opacity-50 pointer-events-none"
                  } text-white ${
                    isDesktopCollapsed ? "justify-center px-0" : "px-4"
                  }`}
                  title={isDesktopCollapsed ? item.label : undefined}
                >
                  <span
                    className={`text-white shrink-0 ${
                      isDesktopCollapsed ? "" : "mr-3"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className={`whitespace-nowrap ${contentHiddenClass}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="px-3 pb-6 border-t border-blue-800 mt-auto pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex items-center justify-center
              w-full px-4 py-2
              rounded bg-white text-blue-700
              font-semibold border border-blue-700
              shadow transition hover:bg-blue-50
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
            title={isDesktopCollapsed ? "Logout" : undefined}
          >
            <MdExitToApp
              size={22}
              className={`shrink-0 ${isDesktopCollapsed ? "" : "mr-2"}`}
            />

            <span
              className={`text-blue-700 text-center w-full ${contentHiddenClass}`}
            >
              Logout
            </span>
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

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <MdExitToApp size={28} className="text-red-500 mr-3 shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Logout
                </h3>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Are you sure you want to log out of the Admin Dashboard?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
