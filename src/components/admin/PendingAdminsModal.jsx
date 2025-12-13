import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext"

export default function PendingAdminsModal({ open, onClose }) {
  const { user, authToken } = useAuth()
  const [pendingAdmins, setPendingAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(null)
  const [notification, setNotification] = useState({ message: "", type: "" })

  useEffect(() => {
    if (open) {
      fetchPendingAdmins()
    }
  }, [open])

  const fetchPendingAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/pending-admins`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setPendingAdmins(data || [])
    } catch (err) {
      console.error("Failed to fetch pending admins:", err)
      showNotification("Failed to load pending admins", "error")
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: "", type: "" }), 3000)
  }

  const handleApprove = async (adminEmail) => {
    setProcessing(adminEmail)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/approve-pending-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          adminEmail,
          approverEmail: user?.email,
          approverRole: user?.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification("Admin account approved successfully!", "success")
        fetchPendingAdmins()
        window.dispatchEvent(new CustomEvent("reloadLogs"))
      } else {
        showNotification(data.error || "Failed to approve admin", "error")
      }
    } catch (err) {
      console.error("Approve error:", err)
      showNotification("Failed to approve admin account", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (adminEmail) => {
    if (!confirm("Are you sure you want to reject this admin account? This action cannot be undone.")) {
      return
    }

    setProcessing(adminEmail)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reject-pending-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          adminEmail,
          approverEmail: user?.email,
          approverRole: user?.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification("Admin account rejected and removed", "success")
        fetchPendingAdmins()
        window.dispatchEvent(new CustomEvent("reloadLogs"))
      } else {
        showNotification(data.error || "Failed to reject admin", "error")
      }
    } catch (err) {
      console.error("Reject error:", err)
      showNotification("Failed to reject admin account", "error")
    } finally {
      setProcessing(null)
    }
  }

  if (!open) return null

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Pending Admin Approvals</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {notification.message && (
          <div
            className={`mb-4 p-3 rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading pending admins...</div>
        ) : pendingAdmins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-semibold mb-2">No Pending Approvals</p>
            <p className="text-sm">All admin accounts have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-3 font-semibold">Full Name</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Requested Date</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{admin.fullName}</td>
                    <td className="p-3 text-sm text-gray-600">{admin.email}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(admin.email)}
                          disabled={processing === admin.email}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === admin.email ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(admin.email)}
                          disabled={processing === admin.email}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
