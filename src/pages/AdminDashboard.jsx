import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar"; // Topbar menu only!

// Example API fetch, replace later!
const fetchAdminStats = async () => ({
  surveys: { active: 7, drafts: 0, closed: 30 },
  responses: { registered: 2, guest: 17 },
  reports: { submitted: 37, drafts: 0 },
  profile: { activeUsers: 7, userCount: 0, respondents: 21 },
});

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar
        onLogout={() => {
          /* implement logout here */
        }}
      />
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-semibold text-2xl">
            Welcome back, <span className="text-blue-700">@Admin!</span>
          </h2>
          <input
            type="search"
            placeholder="Search"
            className="border rounded px-3 py-1 focus:ring focus:ring-blue-200"
            style={{ minWidth: "16rem" }}
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <button className="mt-2 text-xs px-3 py-1 border border-gray-300 rounded font-semibold bg-gray-50 hover:bg-blue-100 transition">
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

// Reusable dashboard info card
function DashboardCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow px-5 py-4 flex flex-col mb-4 border">
      <div className="font-semibold text-lg pb-2 border-b">{title}</div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-1 text-gray-800">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
