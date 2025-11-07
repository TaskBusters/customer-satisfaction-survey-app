import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdAssignment,
  MdQuestionAnswer,
  MdBarChart,
  MdPerson,
  MdHelpOutline,
  MdSettings,
  MdArrowBack,
  MdOutlineAccountCircle,
} from "react-icons/md";



// FAKE admin profile (hardcoded for frontend tests)
const FAKE_ADMIN = {
  name: "Admin",
  email: "admin@example.com",
  avatarUrl: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
};

const FAKE_STATS = {
  surveys: { active: 7, drafts: 0, closed: 30 },
  responses: { registered: 2, guest: 17 },
  reports: { submitted: 37, drafts: 0 },
  profile: { activeUsers: 7, userCount: 0, respondents: 21 },
};

// Sample survey data
const FAKE_SURVEYS = [
  {
    title: "Customer Satisfaction Survey",
    status: "Active",
    responses: 19,
    creator: "Admin 2",
    lastModified: "10/29/2025",
    canEdit: true,
  },
  {
    title: "Untitled 01",
    status: "Draft",
    responses: 0,
    creator: "Admin",
    lastModified: "10/20/2025",
    canEdit: true,
  },
];

// Pass apiEndpoint prop for backend API connector (commented for frontend test)
export default function AdminDashboard(
  {
    // apiEndpoint = "/api/admin/stats", // Uncomment to use backend
  }
) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  // const { pathname } = useLocation();
  const { pathname } = { pathname: "/admin/overview" }; // for static local test

  useEffect(() => {
    // ***** BACKEND CODE COMMENTED OUT *****
    // setLoading(true);
    // fetch(apiEndpoint)
    //   .then(async (res) => {
    //     if (!res.ok) throw new Error("Failed to fetch admin stats");
    //     return await res.json();
    //   })
    //   .then((data) => setStats(data))
    //   .catch(() =>
    //     setStats(FAKE_STATS) // fallback
    //   )
    //   .finally(() => setLoading(false));
    // ***** END API CODE *****

    // FRONTEND LOCAL TEST:
    setTimeout(() => {
      setStats(FAKE_STATS);
      setLoading(false);
    }, 350); // simulate network delay
  }, []);

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
    {
      label: "Reports",
      route: "/admin/reports",
      icon: <MdBarChart size={22} />,
    },
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

  const handleLogout = () => {
    alert("Logged out (frontend fake)");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r min-h-screen">
        <div className="flex items-center px-6 py-5 border-b mb-2">
          <img
            src={FAKE_ADMIN.avatarUrl}
            alt="profile"
            className="w-10 h-10 rounded-full border border-gray-300 mr-3"
          />
          <div>
            <div className="text-lg font-semibold text-gray-700">
              Admin Dashboard
            </div>
            <div className="text-xs text-gray-500">{FAKE_ADMIN.email}</div>
          </div>
        </div>
        <nav className="flex-1">
          <ul>
            {sidebarLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.route}
                  className={`flex items-center px-7 py-2 transition
                    ${
                      pathname === item.route
                        ? "bg-gray-100 border-l-4 border-black font-semibold text-black"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="mr-4 text-black">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto px-6 pb-6">
          <Link
            to="/"
            className="flex items-center px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border font-semibold text-gray-700 transition"
          >
            <MdArrowBack size={20} className="mr-3" />
            Back to Main Menu
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, <span className="font-bold">@{FAKE_ADMIN.name}!</span>
          </h2>
          <div>
            <input
              type="search"
              placeholder="Search"
              className="border rounded px-4 py-2 focus:ring focus:ring-blue-200 w-64"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            <DashboardCard title="Surveys">
              <InfoRow label="Active" value={stats.surveys.active} />
              <InfoRow label="Drafts" value={stats.surveys.drafts} />
              <InfoRow label="Closed" value={stats.surveys.closed} />
            </DashboardCard>
            <DashboardCard title="Responses">
              <InfoRow label="Registered" value={stats.responses.registered} />
              <InfoRow label="Guest" value={stats.responses.guest} />
            </DashboardCard>
            <DashboardCard title="Profile & Security">
              <InfoRow label="Active Users" value={stats.profile.activeUsers} />
              <InfoRow label="User Count" value={stats.profile.userCount} />
              <InfoRow
                label="Registered Respondents"
                value={stats.profile.respondents}
              />
              <button className="mt-3 text-sm px-4 py-1.5 border font-semibold rounded hover:bg-gray-100 transition">
                View Logs
              </button>
            </DashboardCard>
            <DashboardCard title="Reports">
              <InfoRow label="Submitted" value={stats.reports.submitted} />
              <InfoRow label="Drafts" value={stats.reports.drafts} />
            </DashboardCard>
          </section>
        )}
      </main>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border px-5 py-4 flex flex-col shadow min-h-[170px]">
      <div className="font-semibold border-b text-base pb-1 mb-2">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 text-gray-800">
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}


