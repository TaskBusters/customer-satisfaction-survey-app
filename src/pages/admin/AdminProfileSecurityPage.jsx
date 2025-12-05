"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import NotificationBar from "../../components/admin/NotificationBar"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"
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

function CreateAdminModal({ open, user, onClose, onSave, loading }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "surveyadmin",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendVerificationCode = async () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Send verification email
      const emailRes = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          code: code,
        }),
      })

      const emailData = await emailRes.json()

      if (!emailRes.ok) {
        setErrors({ email: emailData.error || "Failed to send verification email" })
        return
      }

      setSentCode(code)
      setStep(2)
    } catch (err) {
      setErrors({ email: "Failed to send verification email" })
    }
  }

  const handleVerifyEmail = () => {
    if (verificationCode !== sentCode) {
      setErrors({ verificationCode: "Verification code is incorrect" })
      return
    }
    setStep(3)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    await onSave(formData)
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "", role: "surveyadmin" })
    setErrors({})
    setStep(1)
    setVerificationCode("")
    setSentCode("")
  }

  if (!open) return null

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
        <h2 className="font-bold mb-4 text-lg">Create New Admin Account</h2>

        {step === 1 && (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  disabled={loading}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className={`w-full border rounded px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border rounded px-3 py-2 pr-10 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password (min 6 chars)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-500 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  className={`w-full border rounded px-3 py-2 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Admin Role</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="surveyadmin">Survey Administrator</option>
                  <option value="analyst">Analyst / Report Viewer</option>
                  <option value="support">Support / Feedback Manager</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                onClick={handleSendVerificationCode}
                disabled={loading}
              >
                Send Verification Code
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              A verification code has been sent to <strong>{formData.email}</strong>
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Verification Code</label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 text-center text-2xl tracking-widest ${
                    errors.verificationCode ? "border-red-500" : "border-gray-300"
                  }`}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength="6"
                  disabled={loading}
                />
                {errors.verificationCode && <p className="text-xs text-red-600 mt-1">{errors.verificationCode}</p>}
                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to the email</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setStep(1)
                  setVerificationCode("")
                  setSentCode("")
                  setErrors({})
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                onClick={handleVerifyEmail}
                disabled={loading}
              >
                Verify Code
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-gray-600 mb-4">Email verified! Now create the admin account.</p>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm">
                  <strong>Full Name:</strong> {formData.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Email:</strong> {formData.email}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Role:</strong> {formData.role}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50"
                onClick={() => {
                  onSave(formData)
                  setFormData({ fullName: "", email: "", password: "", confirmPassword: "", role: "surveyadmin" })
                  setErrors({})
                  setStep(1)
                  setVerificationCode("")
                  setSentCode("")
                }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DeleteAdminModal({ open, admin, onClose, onConfirm, loading }) {
  if (!open) return null
  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4 text-lg text-red-600">Delete Admin Account</h2>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the admin account for <strong>{admin?.fullName}</strong> ({admin?.email})?
        </p>
        <p className="text-sm text-red-500 mb-4">
          This action cannot be undone. All associated logs will remain for audit purposes.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold disabled:opacity-50"
            onClick={() => onConfirm(admin.email)}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileSecurityPage() {
  const { user: currentUser, authToken } = useAuth()
  const canEdit = canEditRoles(currentUser?.role)
  const isSuperAdmin = currentUser?.role === "superadmin"
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ message: "", type: "success" })
  const [targetAdmin, setTargetAdmin] = useState(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [allLogs, setAllLogs] = useState([])

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await res.json()
      setAdmins(data || [])
    } catch (err) {
      console.error("Failed to fetch admins:", err)
    }
  }

  const reloadLogs = async () => {
    try {
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const logsData = await logsRes.json()
      setAllLogs(logsData || [])
    } catch (err) {
      console.error("Failed to reload logs:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchAdmins(), reloadLogs()])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })

    const handleReloadLogs = () => reloadLogs()
    window.addEventListener("reloadLogs", handleReloadLogs)
    return () => window.removeEventListener("reloadLogs", handleReloadLogs)
  }, [])

  const handleEditRole = (admin) => {
    setTargetAdmin(admin)
    setRoleModalOpen(true)
  }

  const handleSaveRole = async (newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          requesterEmail: currentUser.email,
          requesterRole: currentUser.role,
          targetEmail: targetAdmin.email,
          newRole,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        fetchAdmins()
        reloadLogs()
        window.dispatchEvent(new CustomEvent("reloadLogs"))

        if (targetAdmin.email === currentUser.email) {
          window.location.reload()
        }

        setNotification({
          message: "Role updated successfully! Changes are permanent.",
          type: "success",
        })
        setTimeout(() => setNotification({ message: "", type: "success" }), 3000)
        setRoleModalOpen(false)
        setTargetAdmin(null)
      } else {
        throw new Error(data.error || "Failed to update role")
      }
    } catch (err) {
      setNotification({
        message: "Failed to update role: " + (err.message || "Unknown error"),
        type: "error",
      })
      setTimeout(() => setNotification({ message: "", type: "success" }), 3000)
    }
  }

  const handleCreateAdmin = async (formData) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/create-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setNotification({
          message: "Admin account created successfully!",
          type: "success",
        })
        setCreateModalOpen(false)
        fetchAdmins()
      } else {
        setNotification({
          message: data.message || "Failed to create admin account",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error creating admin:", error)
      setNotification({
        message: error.message || "Failed to create admin account",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminEmail) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          requesterEmail: currentUser.email,
          requesterRole: currentUser.role,
          targetEmail: adminEmail,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        fetchAdmins()
        reloadLogs()

        setNotification({
          message: "Admin account deleted successfully!",
          type: "success",
        })
        setDeleteModalOpen(false)
        setDeleteTarget(null)
        setTimeout(() => setNotification({ message: "", type: "success" }), 3000)
      } else {
        throw new Error(data.error || "Failed to delete admin account")
      }
    } catch (err) {
      setNotification({
        message: "Failed to delete admin account: " + (err.message || "Unknown error"),
        type: "error",
      })
      setTimeout(() => setNotification({ message: "", type: "success" }), 3000)
    } finally {
      setDeleteLoading(false)
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4">Admin Accounts & Security</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            + Create Admin Account
          </button>
        </div>
        <NotificationBar
          message={notification.message}
          onClear={() => setNotification({ message: "", type: "success" })}
          msgType={notification.type}
        />

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> Only System Administrators can access this page to manage admin roles and view activity
          logs.
        </div>

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
                            {isSuperAdmin && currentUser.email !== admin.email && (
                              <button
                                onClick={() => {
                                  setDeleteTarget(admin)
                                  setDeleteModalOpen(true)
                                }}
                                className="px-3 py-1 text-sm border border-red-200 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            )}
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
        <CreateAdminModal
          open={createModalOpen}
          user={currentUser}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleCreateAdmin}
          loading={loading}
        />
        <DeleteAdminModal
          open={deleteModalOpen}
          admin={deleteTarget}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteAdmin}
          loading={deleteLoading}
        />
      </main>
    </div>
  )
}
