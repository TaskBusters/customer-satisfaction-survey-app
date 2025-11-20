"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"

function LogsModal({ open, onClose, logs }) {
  if (!open) return null
  return (
    <div className="fixed z-40 inset-0 bg-black/25 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl relative">
        <button className="absolute top-3 right-5 text-gray-400" onClick={onClose}>
          ✗
        </button>
        <h2 className="font-bold mb-4 text-lg">All Admin Activity</h2>
        <ul className="max-h-80 overflow-y-auto text-sm space-y-2">
          {logs.length === 0 ? (
            <li className="text-gray-500">No admin activity yet.</li>
          ) : (
            logs.map((l) => (
              <li key={l.id} className="border-b pb-2 flex justify-between">
                <span>
                  <span className="font-semibold">{l.admin_name || l.admin_email}</span>
                  <span className="text-gray-600 ml-2">{l.action}</span>
                </span>
                <span className="text-xs text-gray-500">{new Date(l.log_time).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allLogs, setAllLogs] = useState([])
  const [logPreview, setLogPreview] = useState([])
  const [logsModal, setLogsModal] = useState(false)

  const reloadLogs = async () => {
    try {
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/logs`)
      const logsData = await logsRes.json()
      setAllLogs(logsData || [])
      setLogPreview((logsData || []).slice(0, 5))
    } catch (err) {
      console.error("Failed to reload logs:", err)
    }
  }

  useEffect(() => {
    Promise.all([fetch(`${API_BASE_URL}/api/admin/stats`).then((r) => r.json()), fetch(`${API_BASE_URL}/api/admin/logs`).then((r) => r.json())])
      .then(([statsData, logsData]) => {
        setStats({
          totalResponses: statsData.responses?.total || 0,
          avgSatisfaction: statsData.responses?.avgSatisfaction || 0,
          activeAdmins: statsData.profile?.activeUsers || 0,
          totalRespondents: statsData.profile?.respondents || 0,
        })
        setAllLogs(logsData || [])
        setLogPreview((logsData || []).slice(0, 5))
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Dashboard error:", err)
        setLoading(false)
      })
    
    // Listen for reload events
    const handleReloadLogs = () => reloadLogs()
    window.addEventListener('reloadLogs', handleReloadLogs)
    return () => window.removeEventListener('reloadLogs', handleReloadLogs)
  }, [])

  const handleShowLogs = () => setLogsModal(true)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, <span className="font-bold">{user?.fullName || "@Admin"}</span>!
          </h2>
        </div>

        {/* Real Stats Cards */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Total Responses</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalResponses || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Avg Satisfaction</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.avgSatisfaction ? Number.parseFloat(stats.avgSatisfaction).toFixed(1) : "—"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Active Admins</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.activeAdmins || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Total Respondents</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.totalRespondents || 0}</p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <h3 className="font-bold mb-4 text-lg">Recent Admin Activity</h3>
        <div className="bg-white border rounded p-4 max-w-4xl">
          <ul className="text-sm space-y-2 max-h-48 overflow-auto">
            {logPreview.length === 0 ? (
              <li className="text-gray-500">No recent activity.</li>
            ) : (
              logPreview.map((l) => (
                <li key={l.id} className="border-b pb-2 last:border-b-0">
                  <span className="font-mono text-xs text-gray-500">{new Date(l.log_time).toLocaleString()}</span>
                  <span className="ml-2 font-semibold">{l.admin_name || l.admin_email}</span>
                  <span className="ml-2 text-gray-700">{l.action}</span>
                </li>
              ))
            )}
          </ul>
          <button className="mt-4 underline text-blue-500 text-sm hover:text-blue-600" onClick={handleShowLogs}>
            View All Logs ({allLogs.length})
          </button>
        </div>
        <LogsModal open={logsModal} onClose={() => setLogsModal(false)} logs={allLogs} />
      </main>
    </div>
  )
}
