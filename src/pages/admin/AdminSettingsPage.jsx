"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import NotificationBar from "../../components/admin/NotificationBar"
import { useAuth } from "../../context/AuthContext"
import { logAdminAction } from "../../utils/adminLogger"
import { API_BASE_URL } from "../../utils/api.js"
import { canManageSettings } from "../../utils/roleUtils"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const canEdit = canManageSettings(user?.role)
  const [language, setLanguage] = useState("english")
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [msgType, setMsgType] = useState("success")

  const fetchData = async () => {
    try {
      const [settingsRes, notifRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/settings`),
        fetch(`${API_BASE_URL}/api/admin/notifications`)
      ]);
      
      const settingsData = await settingsRes.json();
      const notificationsData = await notifRes.json();
      
      if (settingsData.language) setLanguage(settingsData.language);
      setNotifications(notificationsData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const notificationInterval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/admin/notifications`)
        .then((r) => r.json())
        .then((data) => {
          setNotifications(data || []);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }, 3000);

    return () => clearInterval(notificationInterval);
  }, [])

  const handleSaveSettings = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "language", value: language || "" }),
      })

      await logAdminAction(user.email, user.fullName, "Updated general settings")

      // Trigger reload in dashboard
      window.dispatchEvent(new CustomEvent('reloadLogs'))

      setMessage("Settings saved successfully!")
      setMsgType("success")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("Failed to save settings")
      setMsgType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">Loading...</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <NotificationBar message={message} onClear={() => setMessage("")} />

        <div className="space-y-6 max-w-4xl">
          {/* Language Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Language Settings</h2>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Default Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={!canEdit}
                className={`w-full md:w-64 border border-gray-300 rounded px-4 py-2 ${
                  !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="english">English</option>
                <option value="filipino">Filipino</option>
              </select>
            </div>
          </div>

          {/* Save General Settings Button */}
          <div>
            <button
              onClick={handleSaveSettings}
              disabled={!canEdit}
              className={`px-6 py-2 bg-blue-600 text-white rounded font-semibold transition ${
                canEdit ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Save General Settings
            </button>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              View recent notifications about user activities and survey submissions.
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications yet.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{notif.message}</p>
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
          </div>
        </div>
      </main>
    </div>
  )
}
