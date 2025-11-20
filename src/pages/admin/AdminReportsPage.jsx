"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_BASE_URL } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext"
import { logAdminAction } from "../../utils/adminLogger"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [allResponses, setAllResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [serviceFilter, setServiceFilter] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [services, setServices] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const serviceParam = serviceFilter ? `&serviceFilter=${encodeURIComponent(serviceFilter)}` : ""
        const regionParam = regionFilter ? `&regionFilter=${encodeURIComponent(regionFilter)}` : ""
        const dateParam = dateFilter ? `&dateFilter=${encodeURIComponent(dateFilter)}` : ""
        
        const [analyticsData, responsesData] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/analytics?${serviceParam}${regionParam}${dateParam}`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/admin/submissions`).then((r) => r.json()),
        ])
        
        setAnalytics(analyticsData)
        // Parse response_data if needed to get all question answers
        const processedResponses = (responsesData || []).map(r => {
          if (r.response_data && typeof r.response_data === 'string') {
            try {
              const parsed = JSON.parse(r.response_data)
              return { ...r, ...parsed }
            } catch (e) {
              return r
            }
          }
          return r
        })
        setAllResponses(processedResponses)

        const uniqueServices = [...new Set(responsesData?.map((r) => r.service).filter(Boolean))]
        setServices(uniqueServices)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setLoading(false)
      }
    }
    loadData()
  }, [serviceFilter, regionFilter, dateFilter])

  const getFilteredAnalytics = () => {
    let filtered = allResponses
    if (serviceFilter) filtered = filtered.filter((r) => r.service === serviceFilter)
    if (regionFilter) filtered = filtered.filter((r) => r.region === regionFilter)
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((r) => new Date(r.submitted_at).toDateString() === filterDate.toDateString())
    }
    return filtered
  }

  const calculateSQDDistribution = () => {
    const sqdData = {}
    getFilteredAnalytics().forEach((r) => {
      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {}
        Object.entries(sqdRatings).forEach(([key, val]) => {
          if (val !== "NA" && typeof val === "number") {
            sqdData[key] = (sqdData[key] || 0) + 1
          }
        })
      } catch (e) {
        console.error("Error parsing SQD ratings:", e)
      }
    })
    return Object.entries(sqdData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  const calculateSQDDimension = (dimension) => {
    const ratingCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, "NA": 0 }
    getFilteredAnalytics().forEach((r) => {
      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {}
        const rating = sqdRatings[dimension]
        if (rating === "NA") {
          ratingCounts["NA"]++
        } else if (typeof rating === "number" && rating >= 0 && rating <= 8) {
          ratingCounts[rating]++
        }
      } catch (e) {
        console.error("Error parsing SQD ratings:", e)
      }
    })
    return Object.entries(ratingCounts)
      .map(([rating, count]) => ({ rating: rating === "NA" ? "N/A" : `Rating ${rating}`, count }))
      .filter(item => item.count > 0)
  }

  // Calculate Total Satisfaction Distribution
  const calculateSatisfactionDistribution = () => {
    const satisfactionRanges = {
      "0-1": 0,
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0
    }
    getFilteredAnalytics().forEach((r) => {
      const satisfaction = Number.parseFloat(r.average_satisfaction || 0)
      if (satisfaction >= 0 && satisfaction < 1) satisfactionRanges["0-1"]++
      else if (satisfaction >= 1 && satisfaction < 2) satisfactionRanges["1-2"]++
      else if (satisfaction >= 2 && satisfaction < 3) satisfactionRanges["2-3"]++
      else if (satisfaction >= 3 && satisfaction < 4) satisfactionRanges["3-4"]++
      else if (satisfaction >= 4 && satisfaction <= 5) satisfactionRanges["4-5"]++
    })
    return Object.entries(satisfactionRanges)
      .map(([range, count]) => ({ range, count }))
      .filter(item => item.count > 0)
  }

  // Calculate distribution for any question field
  const calculateQuestionDistribution = (fieldName) => {
    const distribution = {}
    getFilteredAnalytics().forEach((r) => {
      // Check both direct field and in response_data
      let value = r[fieldName]
      if (!value && r.response_data) {
        try {
          const responseData = typeof r.response_data === 'string' ? JSON.parse(r.response_data) : r.response_data
          // Map database field names to response data field names
          const fieldMap = {
            'cc_awareness': 'ccAwareness',
            'cc_visibility': 'ccVisibility',
            'cc_helpfulness': 'ccHelpfulness'
          }
          const mappedField = fieldMap[fieldName] || fieldName
          value = responseData[mappedField] || responseData[fieldName]
        } catch (e) {
          // Ignore parse errors
        }
      }
      value = value || "Not Specified"
      // Format numeric values for CC questions
      if (typeof value === 'number') {
        if (fieldName === 'cc_awareness') {
          const labels = {
            1: "I know what a CC is and I saw this office's CC",
            2: "I know what a CC is but I did NOT see this office's CC",
            3: "I learned of the CC only when I saw this office's CC",
            4: "I do not know what a CC is"
          }
          value = labels[value] || `Option ${value}`
        } else if (fieldName === 'cc_visibility') {
          const labels = {
            1: "In the office",
            2: "In the office website",
            3: "Both in the office and website",
            4: "I did not see the CC"
          }
          value = labels[value] || `Option ${value}`
        } else if (fieldName === 'cc_helpfulness') {
          const labels = {
            1: "Very helpful",
            2: "Somewhat helpful",
            3: "Not helpful",
            4: "I did not see the CC"
          }
          value = labels[value] || `Option ${value}`
        }
      }
      distribution[value] = (distribution[value] || 0) + 1
    })
    return Object.entries(distribution)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }

  const sqdLabels = {
    SQD0: "I am satisfied with the service I availed.",
    SQD1: "I spent a reasonable amount of time for my transaction.",
    SQD2: "The office followed the transaction's requirements and steps.",
    SQD3: "The steps I needed to do for my transaction were easy and simple.",
    SQD4: "I easily found information about my transaction from the office or its website.",
    SQD5: "I paid a reasonable amount of fees for my transaction.",
    SQD6: "I feel the office was fair to everyone during my transaction.",
    SQD7: "I was treated courteously by the staff; staff was helpful if asked.",
    SQD8: "I got what I needed or (if denied) denial was sufficiently explained."
  }

  const filteredResponses = getFilteredAnalytics()
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const buildExportRows = () => {
    return getFilteredAnalytics().map((r) => {
      let suggestions = r.suggestions || ""
      if (!suggestions && r.response_data && typeof r.response_data === "string") {
        try {
          const parsed = JSON.parse(r.response_data)
          suggestions = parsed.suggestions || ""
        } catch (err) {
          // ignore parse errors
        }
      }
      return {
        date: r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—",
        name: r.user_name || "Guest",
        email: r.user_email || r.email || "",
        service: r.service || "",
        region: r.region || "",
        clientType: r.client_type || r.clientType || "",
        satisfaction: r.average_satisfaction || "",
        suggestion: suggestions,
      }
    })
  }

  const csvEscape = (value) => {
    const safeValue = (value ?? "").toString().replace(/"/g, '""')
    return `"${safeValue}"`
  }

  const handleExportCSV = async () => {
    const rows = buildExportRows()
    if (!rows.length) return
    const headers = ["Date", "Name", "Email", "Service", "Region", "Client Type", "Average Satisfaction", "Suggestions"]
    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) =>
        [
          row.date,
          row.name,
          row.email,
          row.service,
          row.region,
          row.clientType,
          row.satisfaction,
          row.suggestion,
        ].map(csvEscape).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `survey-report-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to CSV")
    }
  }

  const handleExportPDF = async () => {
    const rows = buildExportRows()
    if (!rows.length || typeof window === "undefined") return
    const printWindow = window.open("", "_blank")
    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>${row.date}</td>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.service}</td>
          <td>${row.region}</td>
          <td>${row.clientType}</td>
          <td>${row.satisfaction}</td>
          <td>${row.suggestion}</td>
        </tr>`
      )
      .join("")
    printWindow.document.write(`
      <html>
        <head>
          <title>Survey Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            h2 { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h2>Survey Report Export</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Service</th>
                <th>Region</th>
                <th>Client Type</th>
                <th>Average Satisfaction</th>
                <th>Suggestions</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to PDF")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">Loading...</main>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Survey Reports & Analytics</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Responses</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{filteredResponses.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Average Satisfaction (0-5)</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {filteredResponses.length > 0
                ? (
                    filteredResponses.reduce((sum, r) => sum + Number.parseFloat(r.average_satisfaction || 0), 0) /
                    filteredResponses.length
                  ).toFixed(2)
                : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Respondents</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{filteredResponses.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-sm">Service Type</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm">Region</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Regions</option>
                {analytics?.byRegion?.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleExportCSV}
              disabled={!filteredResponses.length}
              className={`px-5 py-2 rounded font-semibold transition ${
                filteredResponses.length
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Export to Excel (CSV)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!filteredResponses.length}
              className={`px-5 py-2 rounded font-semibold transition ${
                filteredResponses.length
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Export to PDF
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Total Satisfaction Distribution */}
          {calculateSatisfactionDistribution().length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Total Satisfaction Distribution (0-5 Scale)</h3>
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
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.byRegion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
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

          {/* All SDQS Questions Combined */}
          {calculateSQDDistribution().length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">All Survey Quality Dimensions (SDQS) - Combined</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateSQDDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {calculateSQDDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Service Type Distribution */}
          {calculateQuestionDistribution("service").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Service Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("service")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042">
                    {calculateQuestionDistribution("service").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Age Distribution */}
          {calculateQuestionDistribution("age").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("age")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884D8">
                    {calculateQuestionDistribution("age").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Awareness */}
          {calculateQuestionDistribution("cc_awareness").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Awareness</h3>
              <p className="text-sm text-gray-600 mb-4">Which best describes your awareness of a Citizen's Charter?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_awareness")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F">
                    {calculateQuestionDistribution("cc_awareness").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Visibility */}
          {calculateQuestionDistribution("cc_visibility").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Visibility</h3>
              <p className="text-sm text-gray-600 mb-4">Where did you see the Citizen's Charter?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_visibility")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFBB28">
                    {calculateQuestionDistribution("cc_visibility").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Helpfulness */}
          {calculateQuestionDistribution("cc_helpfulness").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Helpfulness</h3>
              <p className="text-sm text-gray-600 mb-4">How helpful was the Citizen's Charter in your transaction?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_helpfulness")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042">
                    {calculateQuestionDistribution("cc_helpfulness").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* All SDQS Questions Combined */}
          {calculateSQDDistribution().length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">All Survey Quality Dimensions (SDQS) - Combined</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateSQDDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {calculateSQDDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Individual SQD Dimensions 0-8 */}
          {["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"].map((dimension) => {
            const data = calculateSQDDimension(dimension)
            if (data.length === 0) return null
            return (
              <div key={dimension} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-2">SQD {dimension.slice(-1)}: {sqdLabels[dimension]}</h3>
                <p className="text-sm text-gray-600 mb-4">Rating Distribution (0-8 scale)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
