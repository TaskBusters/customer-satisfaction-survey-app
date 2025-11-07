import React, { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SearchBar from "../../components/admin/SearchBar";

// Replace with backend fetch for live data!
const FAKE_INFOS = [
  { label: "About", value: "Info about the app" },
  { label: "Help & FAQ", value: "FAQ Resource" },
  { label: "Privacy Policy", value: "Your privacy..." },
];

export default function AdminSettingsPage() {
  const [infos, setInfos] = useState(FAKE_INFOS);
  const [search, setSearch] = useState("");

  // For demo only—filter notifications and info
  const filteredInfos = infos.filter((info) =>
    info.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="font-bold text-2xl mb-6">Settings</div>
        <div className="flex justify-between items-center mb-5">
          <div className="font-semibold">Manage Notifications</div>
          <div className="w-full md:w-auto">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="max-w-md"
            />
          </div>
        </div>
        {/* Notifications Box */}
        <div
          className="border rounded bg-white p-8 flex items-center justify-center mb-6"
          style={{ minHeight: 110 }}
        >
          <span className="text-gray-400 text-lg">No Notifications</span>
        </div>
        <div className="font-semibold mb-2">Update Information</div>
        <div className="flex flex-col gap-3">
          {filteredInfos.length > 0 ? (
            filteredInfos.map((info, idx) => (
              <div
                key={info.label}
                className="border rounded flex items-center justify-between px-4 py-3 bg-gray-50"
              >
                <span>{info.label}</span>
                <div className="flex gap-2">
                  <button
                    title="Edit"
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <svg
                      width={18}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.232 5.232l3.536 3.536M9 11l5.5-5.5a2.121 2.121 0 1 1 3 3L12 14l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    title="Delete"
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg
                      width={18}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center p-6">
              No update info found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
