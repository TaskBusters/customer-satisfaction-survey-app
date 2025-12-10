"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import NotificationBar from "../../components/admin/NotificationBar"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"
import { canEditRoles } from "../../utils/roleUtils"
import RoleEditModal from "../../components/admin/RoleEditModal"
import CreateAdminModal from "../../components/admin/CreateAdminModal"
import DeleteAdminModal from "../../components/admin/DeleteAdminModal"
import AdminLogsTable from "../../components/admin/AdminLogsTable"
import AdminsTable from "../../components/admin/AdminsTable"

export default function AdminProfileSecurityPage() {
  const { user: currentUser, authToken } = useAuth()
  const canEdit = canEditRoles(currentUser?.role)
  const isSuperAdmin = currentUser?.role === "superadmin"

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  })

  const [targetAdmin, setTargetAdmin] = useState(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [allLogs, setAllLogs] = useState([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [adminSearch, setAdminSearch] = useState("")
  const [adminPage, setAdminPage] = useState(1)

  const logsPerPage = 10
  const adminsPerPage = 10

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
      const sortedLogs = logsData.sort((a, b) => new Date(b.log_time) - new Date(a.log_time))
      setAllLogs(sortedLogs || [])
    } catch (err) {
      console.error("Failed to reload logs:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchAdmins(), reloadLogs()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))

    const handleReloadLogs = () => reloadLogs()
    window.addEventListener("reloadLogs", handleReloadLogs)
    return () => window.removeEventListener("reloadLogs", handleReloadLogs)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterAction])

  useEffect(() => {
    setAdminPage(1)
  }, [adminSearch])

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
          <strong>Note:</strong> This page is viewable by all admins. Only System Administrators can manage roles and
          view audit logs.
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

        <AdminsTable
          admins={admins}
          loading={loading}
          canEdit={canEdit}
          isSuperAdmin={isSuperAdmin}
          currentUser={currentUser}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          adminPage={adminPage}
          setAdminPage={setAdminPage}
          adminsPerPage={adminsPerPage}
          getRoleDescription={getRoleDescription}
          onEditRole={handleEditRole}
          onDeleteAdmin={(admin) => {
            setDeleteTarget(admin)
            setDeleteModalOpen(true)
          }}
        />

        <AdminLogsTable
          allLogs={allLogs}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterAction={filterAction}
          setFilterAction={setFilterAction}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          logsPerPage={logsPerPage}
        />

        <RoleEditModal
          open={roleModalOpen}
          user={targetAdmin}
          onClose={() => setRoleModalOpen(false)}
          onSave={handleSaveRole}
        />
        <CreateAdminModal
          open={createModalOpen}
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
