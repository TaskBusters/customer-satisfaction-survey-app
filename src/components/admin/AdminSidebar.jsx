import React from "react";
import { Link, useLocation } from "react-router-dom";
import valenzuelaLogo from "../../assets/valenzuela-logo.png";
import {
  MdDashboard,
  MdAssignment,
  MdQuestionAnswer,
  MdBarChart,
  MdPerson,
  MdHelpOutline,
  MdSettings,
  MdArrowBack,
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
    label: "Settings",
    route: "/admin/settings",
    icon: <MdSettings size={22} />,
  },
];

function AdminSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-72 bg-blue-700 min-h-screen text-white">
      {" "}
      {/* blue sidebar */}
      <div className="flex items-center px-6 py-5 border-b border-blue-800 mb-2">
        <img
          src={FAKE_ADMIN.avatarUrl}
          alt="Valenzuela Logo"
          className="w-10 h-10 rounded-full border border-blue-300 mr-3"
        />
        <div>
          <div className="text-lg font-semibold text-white">
            Admin Dashboard
          </div>
          <div className="text-xs text-blue-100">{FAKE_ADMIN.email}</div>
        </div>
      </div>
      <nav className="flex-1">
        <ul>
          {sidebarLinks.map((item) => (
            <li key={item.label}>
              <Link
                to={item.route}
                className={`flex items-center px-7 py-2 transition rounded-lg ${
                  pathname === item.route
                    ? "bg-blue-800 bg-opacity-90 border-l-4 border-white font-semibold"
                    : "hover:bg-blue-600 bg-opacity-70"
                } text-white`}
              >
                <span className="mr-4 text-white">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-6 pb-6">
        <Link
          to="/"
          className="flex items-center px-3 py-2 rounded bg-blue-600 hover:bg-blue-800 border font-semibold text-white transition"
        >
          <MdArrowBack size={20} className="mr-3" />
          Back to Main Menu
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
