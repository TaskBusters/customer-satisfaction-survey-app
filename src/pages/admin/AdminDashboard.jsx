"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Pagination from "../../components/common/Pagination"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"

function LogsModal({ open, onClose, logs }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  // 1. CONCISE ACTION FILTER LOGIC
  const getActionFilterLabel = (actionString) => {
    const firstWord = actionString.split(" ")[0].toUpperCase()
    return firstWord
  }

  const uniqueActionLabels = [...new Set(logs.map((l) => getActionFilterLabel(l.action)))].sort()

  // Filtering logic updated to use the concise label
  const filteredLogs = logs.filter((l) => {
    const logActionLabel = getActionFilterLabel(l.action)

    const searchMatch =
      (l.admin_name || l.admin_email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())

    const actionMatch = filterAction === "" || logActionLabel === filterAction

    return searchMatch && actionMatch
  })

  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterAction, logs])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ⭐ START: New Pagination Helper Function ⭐
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // e.g., 1, 2, 3, 4, 5, ..., N
    const halfLimit = Math.floor(maxPagesToShow / 2)

    if (totalPages <= maxPagesToShow) {
      // If total pages are small, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show the first page
      pageNumbers.push(1)

      // Determine the start and end of the dynamic range
      let start = Math.max(2, currentPage - halfLimit)
      let end = Math.min(totalPages - 1, currentPage + halfLimit)

      // Adjust start/end if current page is near the beginning or end
      if (currentPage < maxPagesToShow - 1) {
        end = maxPagesToShow - 1
      }
      if (currentPage > totalPages - (maxPagesToShow - 2)) {
        start = totalPages - (maxPagesToShow - 2)
      }

      // Add ellipsis if needed after page 1
      if (start > 2) {
        pageNumbers.push("...")
      }

      // Add the dynamic range pages
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i)
        }
      }

      // Add ellipsis if needed before the last page
      if (end < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show the last page (only if it's not the first page)
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    // Filter out duplicate page numbers
    return [...new Set(pageNumbers)].filter(
      (p) => p !== "..." || (p === "..." && pageNumbers.indexOf(p) !== pageNumbers.lastIndexOf(p)),
    )
  }
  // ⭐ END: New Pagination Helper Function ⭐

  if (!open) return null

  return (
    <div className="fixed z-40 inset-0 bg-black/25 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none font-light"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="font-bold mb-4 text-xl border-b pb-2">All Admin Activity ({filteredLogs.length} entries)</h2>

        {/* Search Filters */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search name or action..."
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 max-w-xs"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            {/* Using the concise action labels */}
            {uniqueActionLabels.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        {/* Log List */}
        <ul className="max-h-96 overflow-y-auto text-sm space-y-2 mb-4 pr-2">
          {currentLogs.length === 0 ? (
            <li className="text-gray-500 py-8 text-center bg-gray-50 rounded">No results found for current filters.</li>
          ) : (
            currentLogs.map((l) => (
              <li
                key={l.id}
                className="border-b pb-2 flex justify-between hover:bg-gray-50 px-1 rounded transition-colors"
              >
                <span>
                  <span className="font-semibold text-gray-800">{l.admin_name || l.admin_email}</span>
                  <span className="text-gray-600 ml-2">{l.action}</span>
                </span>
                <span className="text-xs text-gray-500 min-w-max">{new Date(l.log_time).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={paginate} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [allResponses, setAllResponses] = useState([])
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
    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/stats`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/admin/logs`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/admin/analytics`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/admin/submissions`).then((r) => r.json()),
    ])
      .then(([statsData, logsData, analyticsData, responsesData]) => {
        setStats({
          totalResponses: statsData?.totalResponses || 0,
          avgSatisfaction: statsData?.avgSatisfaction || 0,
          activeAdmins: statsData?.activeAdmins || 0,
          totalRespondents: statsData?.totalRespondents || 0,
        })
        setAnalytics(analyticsData)
        setAllResponses(responsesData || [])
        setAllLogs(logsData || [])
        setLogPreview((logsData || []).slice(0, 5))
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Dashboard error:", err)
        setLoading(false)
      })

    const handleReloadLogs = () => reloadLogs()
    window.addEventListener("reloadLogs", handleReloadLogs)
    return () => window.removeEventListener("reloadLogs", handleReloadLogs)
  }, [])

  const handleShowLogs = () => setLogsModal(true)

  const calculateSatisfactionDistribution = () => {
    const satisfactionRanges = {
      "0-1": 0,
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0,
    }
    allResponses.forEach((r) => {
      const satisfaction = Number.parseFloat(r.average_satisfaction || 0)
      if (satisfaction >= 0 && satisfaction < 1) satisfactionRanges["0-1"]++
      else if (satisfaction >= 1 && satisfaction < 2) satisfactionRanges["1-2"]++
      else if (satisfaction >= 2 && satisfaction < 3) satisfactionRanges["2-3"]++
      else if (satisfaction >= 3 && satisfaction < 4) satisfactionRanges["3-4"]++
      else if (satisfaction >= 4 && satisfaction <= 5) satisfactionRanges["4-5"]++
    })
    return Object.entries(satisfactionRanges)
      .map(([range, count]) => ({ range, count }))
      .filter((item) => item.count > 0)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

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
          <>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Satisfaction Distribution */}
              {calculateSatisfactionDistribution().length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4">Satisfaction Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={calculateSatisfactionDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F">
                        {calculateSatisfactionDistribution().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gender Distribution */}
              {analytics?.byGender && analytics.byGender.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4">Gender Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.byGender}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gender" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {analytics.byGender.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Client Type Distribution */}
              {analytics?.byClientType && analytics.byClientType.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4">Client Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.byClientType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="client_type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d">
                        {analytics.byClientType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Region Distribution */}
              {analytics?.byRegion && analytics.byRegion.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4">Region Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.byRegion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658">
                        {analytics.byRegion.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recent Activity */}
        <h3 className="font-bold mb-4 text-lg">Recent Admin Activity</h3>

        <div className="bg-white border rounded p-4 w-full">
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
