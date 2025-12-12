"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import NotificationBar from "../../components/admin/NotificationBar.jsx";
import Pagination from "../../components/common/Pagination";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../utils/api.js";
import { canViewNotifications } from "../../utils/roleUtils.js";
import { logAdminAction } from "../../utils/adminLogger.js";

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
  const [deletingId, setDeletingId] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // --- MODIFIED: Single function to fetch data for the given page ---
  const fetchData = async (page) => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/admin/notifications?page=${page}&limit=${NOTIFICATIONS_PER_PAGE}`;
      console.log("[v0] Fetching notifications from:", url);

      const notifRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!notifRes.ok) {
        const errorText = await notifRes.text();
        console.error(
          "[v0] Notifications fetch failed:",
          notifRes.status,
          errorText
        );
        throw new Error(`Failed to fetch notifications (${notifRes.status})`);
      }

      const response = await notifRes.json();
      console.log("[v0] Notifications response:", response);

      const notificationsData = response.data || response;

      let totalItems = response.total || null;

      // If the API did not provide a total count, fetch a full list (fallback)
      if (!totalItems) {
        try {
          const fullRes = await fetch(
            `${API_BASE_URL}/api/admin/notifications?limit=100000`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          if (fullRes.ok) {
            const fullData = await fullRes.json();
            const fullList = fullData.data || fullData;
            totalItems = Array.isArray(fullList)
              ? fullList.length
              : notificationsData.length;
          } else {
            totalItems = notificationsData.length;
          }
        } catch (e) {
          totalItems = notificationsData.length;
        }
      }

      setNotifications(notificationsData || []);
      setTotalCount(totalItems);
      setTotalPages(Math.ceil(totalItems / NOTIFICATIONS_PER_PAGE));
      setCurrentPage(page);

      if (msgType === "error") {
        setMessage("");
        setMsgType("success");
      }
    } catch (err) {
      console.error("[v0] Error fetching notifications:", err);
      setMessage("Failed to load notifications. Please check server logs.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete notification");
      }

      // Remove locally and update counts/pages safely
      setNotifications((prev) => {
        const newList = prev.filter((n) => n.id !== id);
        return newList;
      });

      setTotalCount((prevCount) => {
        const newCount = Math.max(0, prevCount - 1);
        setTotalPages(
          Math.max(1, Math.ceil(newCount / NOTIFICATIONS_PER_PAGE))
        );
        return newCount;
      });

      setMessage("Notification dismissed");
      setMsgType("success");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("Delete notification error:", err);
      setMessage("Failed to dismiss notification");
      setMsgType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      return;
    }

    setDeletingAll(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/notifications/delete-all`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete all notifications");
      }

      const data = await res.json();

      // Log the action
      await logAdminAction(
        user?.email,
        user?.fullName,
        `Deleted all notifications (${data.deletedCount} notifications removed)`
      );

      setNotifications([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentPage(1);

      setMessage(`Successfully deleted ${data.deletedCount} notifications`);
      setMsgType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Delete all notifications error:", err);
      setMessage("Failed to delete all notifications");
      setMsgType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDeletingAll(false);
      setConfirmDeleteAll(false);
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Activities
              </h2>
              {totalCount > 0 &&
                (confirmDeleteAll ? (
                  <div className="flex gap-2">
                    <button
                      onClick={deleteAllNotifications}
                      disabled={deletingAll}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 font-semibold"
                    >
                      {deletingAll ? "Deleting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAll(false)}
                      disabled={deletingAll}
                      className="px-3 py-1.5 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 disabled:opacity-50 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={deleteAllNotifications}
                    disabled={deletingAll || confirmDeleteId !== null}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition flex items-center gap-2"
                    title="Delete All Notifications"
                  >
                    <MdDelete size={22} />
                  </button>
                ))}
            </div>
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
                  <div
                    key={notif.id}
                    className="w-full border rounded p-4 bg-gray-50 hover:bg-gray-100 flex items-start justify-between"
                  >
                    <div className="flex-1 mr-4">
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

                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {notif.notification_type}
                      </span>

                      {confirmDeleteId === notif.id ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            disabled={deletingId === notif.id}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === notif.id
                              ? "Deleting..."
                              : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          disabled={
                            deletingId === notif.id || confirmDeleteId !== null
                          }
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          aria-label={`Dismiss notification ${notif.id}`}
                          title="Dismiss notification"
                        >
                          <MdDelete size={18} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  if (!loading) handlePageChange(p);
                }}
                showInfo={true}
              />
            </div>
            {/* End Pagination Controls */}
          </div>
        </div>
      </main>
    </div>
  );
}
