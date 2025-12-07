"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import NotificationBar from "../../components/admin/NotificationBar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../utils/api.js";
import { canViewNotifications } from "../../utils/roleUtils.js";

// --- CONSTANTS ---
const NOTIFICATIONS_PER_PAGE = 10;

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const canView = canViewNotifications(user?.role);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modified fetchData to include pagination parameters
  const fetchData = async (page = currentPage) => {
    setLoading(true);
    try {
      // NOTE: API must support limit, offset/page parameters for this to work
      const url = `${API_BASE_URL}/api/admin/notifications?page=${page}&limit=${NOTIFICATIONS_PER_PAGE}`;
      const notifRes = await fetch(url);

      if (!notifRes.ok) {
        throw new Error("Failed to fetch notifications.");
      }

      // Assuming the API returns data in a structure like { data: [...], total: X }
      const response = await notifRes.json();

      const notificationsData = response.data || response;
      const totalItems = response.total || notificationsData.length;

      setNotifications(notificationsData || []);
      setTotalCount(totalItems);
      setTotalPages(Math.ceil(totalItems / NOTIFICATIONS_PER_PAGE));
      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setMessage("Failed to load notifications.");
      setMsgType("error");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for page 1
    fetchData(1);

    // Set up polling for real-time updates (only fetch the first page for background updates)
    const notificationInterval = setInterval(() => {
      fetch(
        `${API_BASE_URL}/api/admin/notifications?page=1&limit=${NOTIFICATIONS_PER_PAGE}`
      )
        .then((r) => r.json())
        .then((data) => {
          // Only update if on page 1, otherwise let user manually refresh/navigate
          if (currentPage === 1) {
            const notificationsData = data.data || data;
            setNotifications(notificationsData || []);
            setTotalCount(data.total || notificationsData.length);
          }
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }, 3000);

    return () => clearInterval(notificationInterval);
  }, [currentPage]);

  // Pagination Handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // fetchData will be called via useEffect due to currentPage change
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">
          Loading notifications...
        </main>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to view notifications.
          </p>
        </main>
      </div>
    );
  }

  return (
    // Set parent container to flex column to calculate dynamic height easily
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />

      {/* MODIFICATION: The main content area uses flex-col and flex-1 */}
      <main className="flex-1 p-10 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">
          Notifications ({totalCount} total)
        </h1>
        <NotificationBar message={message} onClear={() => setMessage("")} />

        {/* MODIFICATION: flex-1 to occupy remaining vertical space */}
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Recent Activities
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              View recent notifications about user activities and survey
              submissions.
            </p>

            {/* MODIFICATION: Dynamic Height & Scrollable Feed */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-4">
              {notifications.length === 0 && !loading ? (
                <p className="text-gray-500 text-sm">
                  No notifications found for this page.
                </p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.user_name && `User: ${notif.user_name}`}
                          {notif.user_email && ` (${notif.user_email})`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {notif.notification_type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <span className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages} ({totalCount}{" "}
                  total)
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {/* End Pagination Controls */}
          </div>
        </div>
      </main>
    </div>
  );
}
