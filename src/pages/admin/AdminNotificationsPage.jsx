"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import NotificationBar from "../../components/admin/NotificationBar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../utils/api.js";
import { canViewNotifications } from "../../utils/roleUtils.js";

// --- CONSTANTS ---
const NOTIFICATIONS_PER_PAGE = 10;
const POLLING_INTERVAL = 10000; // Poll every 10 seconds

export default function AdminNotificationsPage() {
  const { user, authToken } = useAuth();
  const canView = canViewNotifications(user?.role);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // --- MODIFIED: Single function to fetch data for the given page ---
  const fetchData = async (page) => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/admin/notifications?page=${page}&limit=${NOTIFICATIONS_PER_PAGE}`;
      const notifRes = await fetch(url, {
        headers: {
          // Add Authorization for admin endpoints
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!notifRes.ok) {
        throw new Error("Failed to fetch notifications.");
      }

      const response = await notifRes.json();
      const notificationsData = response.data || response;
      const totalItems = response.total || notificationsData.length;

      setNotifications(notificationsData || []);
      setTotalCount(totalItems);
      setTotalPages(Math.ceil(totalItems / NOTIFICATIONS_PER_PAGE));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setMessage("Failed to load notifications. Please check server logs.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  // --- CORRECTED useEffect for Pagination & Initial Load ---
  useEffect(() => {
    // This hook runs on mount and whenever currentPage changes.
    // It is responsible for loading the data for the current page.
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Dependency on currentPage ensures re-fetch on page change

  // --- NEW useEffect for Polling (Background Refresh) ---
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      // Polling only affects the first page to minimize load and disruption.
      if (currentPage === 1) {
        // Use a lightweight fetch without setting loading state or full error message
        fetch(
          `${API_BASE_URL}/api/admin/notifications?page=1&limit=${NOTIFICATIONS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
          .then((r) => {
            if (!r.ok) throw new Error("Polling failed.");
            return r.json();
          })
          .then((data) => {
            const notificationsData = data.data || data;
            setNotifications(notificationsData || []);
            setTotalCount(data.total || notificationsData.length);
            setTotalPages(
              Math.ceil(
                (data.total || notificationsData.length) /
                  NOTIFICATIONS_PER_PAGE
              )
            );
          })
          .catch((err) => console.error("Error polling notifications:", err));
      }
    }, POLLING_INTERVAL);

    // Clean up the interval when the component unmounts
    return () => clearInterval(notificationInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]); // Polling only needs to restart if the auth token changes

  // Pagination Handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      // Simply update the state. The first useEffect will handle the data fetch.
      setCurrentPage(page);
    }
  };

  if (loading && totalCount === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">
          <p className="text-gray-600">Loading notifications...</p>
        </main>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600">Access Denied 🚫</h1>
          <p className="text-gray-600">
            You do not have permission to view notifications.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />

      <main className="flex-1 p-10 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">
          Notifications ({totalCount} total)
        </h1>
        <NotificationBar
          message={message}
          onClear={() => setMessage("")}
          msgType={msgType}
        />

        <div className="space-y-6 flex-1 flex flex-col">
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Recent Activities
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              View recent notifications about user activities and survey
              submissions.
            </p>

            {/* Notification items container */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-4">
              {loading && totalCount > 0 ? (
                <p className="text-gray-500 text-sm">
                  Loading page {currentPage}...
                </p>
              ) : notifications.length === 0 ? (
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
                {/* CORRECTED DISPLAY: Use <strong> tags for bolding instead of ** literals */}
                <span className="text-sm text-gray-700">
                  Showing page{" "}
                  <strong className="font-semibold text-gray-900">
                    {currentPage}
                  </strong>{" "}
                  of{" "}
                  <strong className="font-semibold text-gray-900">
                    {totalPages}
                  </strong>{" "}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
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
