"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import NotificationBar from "../../components/admin/NotificationBar"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"
import { logAdminAction } from "../../utils/adminLogger"
import { canEditRoles } from "../../utils/roleUtils"

function RoleEditModal({ open, user, onClose, onSave }) {
  const [newRole, setNewRole] = useState(user?.role || "")
  useEffect(() => setNewRole(user?.role || ""), [user])

  if (!open) return null
  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4 text-lg">Change Admin Role</h2>
        <p className="text-sm text-gray-600 mb-2">Admin: {user?.fullName}</p>
        <p className="text-xs text-gray-500 mb-4">{user?.email}</p>
        <label className="block font-semibold mb-2 text-sm">Select Role</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="superadmin">System Administrator</option>
          <option value="surveyadmin">Survey Administrator</option>
          <option value="analyst">Analyst / Report Viewer</option>
          <option value="support">Support / Feedback Manager</option>
        </select>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => onSave(newRole)}
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileSecurityPage() {
  const { user: currentUser } = useAuth()
  const canEdit = canEditRoles(currentUser?.role)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [msgType, setMsgType] = useState("success")
  const [targetAdmin, setTargetAdmin] = useState(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [allLogs, setAllLogs] = useState([])

  const reloadLogs = async () => {
    try {
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/logs`)
      const logsData = await logsRes.json()
      setAllLogs(logsData || [])
    } catch (err) {
      console.error("Failed to reload logs:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/users`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/admin/logs`).then((res) => res.json())
    ])
      .then(([usersData, logsData]) => {
        setAdmins(usersData)
        setAllLogs(logsData || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
    
    // Listen for reload events
    const handleReloadLogs = () => reloadLogs()
    window.addEventListener('reloadLogs', handleReloadLogs)
    return () => window.removeEventListener('reloadLogs', handleReloadLogs)
  }, [])

  const handleEditRole = (admin) => {
    setTargetAdmin(admin)
    setRoleModalOpen(true)
  }

  const handleSaveRole = async (newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterEmail: currentUser.email,
          requesterRole: currentUser.role,
          targetEmail: targetAdmin.email,
          newRole,
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        // Reload admin list from server to get the updated role
        const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`)
        const usersData = await usersRes.json()
        setAdmins(usersData)
        
        // Reload logs to show the new log entry
        const logsRes = await fetch(`${API_BASE_URL}/api/admin/logs`)
        const logsData = await logsRes.json()
        setAllLogs(logsData || [])
        
        // Trigger reload in dashboard
        window.dispatchEvent(new CustomEvent('reloadLogs'))
        
        // Update current user if they edited their own role (shouldn't happen, but just in case)
        if (targetAdmin.email === currentUser.email) {
          // Reload page or update current user context
          window.location.reload()
        }
        
        setMessage("Role updated successfully! Changes are permanent.")
        setMsgType("success")
        setTimeout(() => setMessage(""), 3000)
        setRoleModalOpen(false)
        setTargetAdmin(null)
      } else {
        throw new Error(data.error || "Failed to update role")
      }
    } catch (err) {
      setMessage("Failed to update role: " + (err.message || "Unknown error"))
      setMsgType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }


  const getRoleDescription = (role) => {
    const roleLower = role?.toLowerCase() || ""
    const descriptions = {
      superadmin: "Full system access, can manage all admins and settings",
      "system admin": "Full system access, can manage all admins and settings",
      surveyadmin: "Full control over survey and data, cannot manage admin roles",
      "survey admin": "Full control over survey and data, cannot manage admin roles",
      analyst: "Read-only access to analytics and reports",
      "report viewer": "Read-only access to analytics and reports",
      support: "Limited access to help and feedback management",
      "feedback manager": "Limited access to help and feedback management",
    }
    return descriptions[roleLower] || role
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Admin Accounts & Security</h1>
        <NotificationBar message={message} onClear={() => setMessage("")} msgType={msgType} />
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> Only System Administrators can access this page to manage admin roles and view activity logs.
        </div>

        {/* Current Admin Info */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Your Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{currentUser.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold text-gray-900">{currentUser.role || "user"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="font-semibold text-gray-900">System Administrators</p>
            <p className="text-sm text-gray-600 mt-1">View admin accounts and manage roles (superadmin only)</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading admins...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Role</th>
                    <th className="px-6 py-3 text-left font-semibold">Description</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No admin users found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.email} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{admin.fullName}</td>
                        <td className="px-6 py-3 text-gray-700 text-xs">{admin.email}</td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{getRoleDescription(admin.role)}</td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditRole(admin)}
                              disabled={!canEdit || currentUser.email === admin.email}
                              className={`px-3 py-1 text-sm border rounded transition ${
                                canEdit && currentUser.email !== admin.email
                                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                  : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Edit Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Activity Logs Table */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="font-semibold text-gray-900">Admin Activity Logs</p>
            <p className="text-sm text-gray-600 mt-1">Full detail log history of all admin activities</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Date & Time</th>
                      <th className="px-6 py-3 text-left font-semibold">Admin Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Admin Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No admin activity logs found
                        </td>
                      </tr>
                    ) : (
                      allLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-700 whitespace-nowrap">
                            {new Date(log.log_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-900">{log.admin_name || "—"}</td>
                          <td className="px-6 py-3 text-gray-700 text-xs">{log.admin_email || "—"}</td>
                          <td className="px-6 py-3 text-gray-700">{log.action || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <RoleEditModal
          open={roleModalOpen}
          user={targetAdmin}
          onClose={() => setRoleModalOpen(false)}
          onSave={handleSaveRole}
        />
      </main>
    </div>
  )
}
