import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import Pagination from "../../components/common/Pagination"
import SearchBar from "../../components/admin/SearchBar"
import { API_BASE_URL } from "../../utils/api.js"

export default function AdminSurveyResponsesPage() {
  const [responses, setResponses] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterRegion, setFilterRegion] = useState("")
  const [filterClientType, setFilterClientType] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [regions, setRegions] = useState([])
  const [clientTypes, setClientTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const responsesPerPage = 10

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/admin/submissions`)
      .then((res) => res.json())
      .then((data) => {
        setResponses(data)

        const uniqueRegions = [...new Set(data.map((r) => r.region).filter(Boolean))]
        const uniqueClientTypes = [...new Set(data.map((r) => r.client_type).filter(Boolean))]
        setRegions(uniqueRegions)
        setClientTypes(uniqueClientTypes)

        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredResponses = responses.filter((res) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      (res.user_name && res.user_name.toLowerCase().includes(searchLower)) ||
      (res.region && res.region.toLowerCase().includes(searchLower))

    const matchesRegion = !filterRegion || res.region === filterRegion
    const matchesClientType = !filterClientType || res.client_type === filterClientType

    let matchesDateRange = true
    if (dateFrom || dateTo) {
      const resDate = new Date(res.submitted_at)
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        matchesDateRange = resDate >= fromDate
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        matchesDateRange = matchesDateRange && resDate <= toDate
      }
    }

    return matchesSearch && matchesRegion && matchesClientType && matchesDateRange
  })

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterRegion, filterClientType, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredResponses.length / responsesPerPage)
  const indexOfLast = currentPage * responsesPerPage
  const indexOfFirst = indexOfLast - responsesPerPage
  const currentResponses = filteredResponses.slice(indexOfFirst, indexOfLast)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Survey Respondents</h1>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold mb-2">Search</label>
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, region..." />
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Regions</option>
                {regions
                  .sort((a, b) => a.localeCompare(b))
                  .map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
              </select>
            </div>

            {/* Client Type Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">Client Type</label>
              <select
                value={filterClientType}
                onChange={(e) => setFilterClientType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {clientTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-semibold mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Reset Filters */}
          {(search || filterRegion || filterClientType || dateFrom || dateTo) && (
            <div className="mt-4 pt-4 border-t flex gap-2">
              <button
                onClick={() => {
                  setSearch("")
                  setFilterRegion("")
                  setFilterClientType("")
                  setDateFrom("")
                  setDateTo("")
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold text-sm"
              >
                Reset Filters
              </button>
              <span className="text-sm text-gray-600 self-center">
                Showing {filteredResponses.length} of {responses.length} responses
              </span>
            </div>
          )}
        </div>

        {/* Responsive Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Gender</th>
                  <th className="px-6 py-3 text-left font-semibold">Age</th>
                  <th className="px-6 py-3 text-left font-semibold">Region</th>
                  <th className="px-6 py-3 text-left font-semibold">Client Type</th>
                  <th className="px-6 py-3 text-left font-semibold">Satisfaction</th>
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentResponses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No responses found
                    </td>
                  </tr>
                ) : (
                  currentResponses.map((res) => (
                    <tr key={res.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{res.user_name || "Guest"}</td>
                      <td className="px-6 py-3">{res.gender === "na" ? "N/A" : res.gender || "—"}</td>
                      <td className="px-6 py-3">{res.age || "—"}</td>
                      <td className="px-6 py-3">{res.region || "—"}</td>
                      <td className="px-6 py-3">{res.client_type || "—"}</td>
                      <td className="px-6 py-3 font-semibold">
                        {res.average_satisfaction ? Number.parseFloat(res.average_satisfaction).toFixed(1) : "—"}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600">
                        {new Date(res.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination for responses */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              showInfo={true}
            />
          </div>
        )}
      </main>
    </div>
  )
}
