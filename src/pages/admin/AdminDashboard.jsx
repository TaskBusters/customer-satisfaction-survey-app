import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Header from "../../components/admin/Header";
import DashboardStats from "../../components/admin/DashboardStats";
import SearchBar from "../../components/admin/SearchBar";

const FAKE_STATS = {
  surveys: { active: 7, drafts: 0, closed: 30 },
  responses: { registered: 2, guest: 17 },
  reports: { submitted: 37, drafts: 0 },
  profile: { activeUsers: 7, userCount: 0, respondents: 21 },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setStats(FAKE_STATS);
      setLoading(false);
    }, 350);
  }, []);

  // Optionally: filter stats shown in DashboardStats
  // Example, if you have a surveys list to filter.
  // Otherwise, provide full stats

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, <span className="font-bold">@Admin!</span>
          </h2>
          <div className="w-full md:w-auto">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="max-w-md"
            />
          </div>
        </div>

        <DashboardStats loading={loading} stats={stats} search={search} />
        {/* If you implement cards or tables that can be filtered, filter them here using `search` */}
      </main>
    </div>
  );
}
