"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
}

export default function Submissions() {
  const { user, isGuest } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState("success")
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isGuest) {
      navigate("/login", { replace: true })
      return
    }
    fetchSubmissions()
  }, [user, isGuest, navigate])

  function fetchSubmissions() {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/submissions/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSubmissions([])
        setLoading(false)
      })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user.email }),
      })
      if (res.ok) {
        setMsg("Submission deleted successfully")
        setMsgType("success")
        setTimeout(() => setMsg(""), 3000)
        fetchSubmissions()
      }
    } catch (err) {
      setMsg("Failed to delete submission")
      setMsgType("error")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  const handleEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/detail/${id}`)
      if (res.ok) {
        const submission = await res.json()
        // Navigate to survey form with pre-filled data
        navigate(`/survey/edit/${id}`, { state: { submission } })
      } else {
        setMsg("Failed to load submission for editing")
        setMsgType("error")
        setTimeout(() => setMsg(""), 3000)
      }
    } catch (err) {
      setMsg("Failed to load submission for editing")
      setMsgType("error")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/detail/${id}`)
      if (res.ok) {
        const submission = await res.json()
        setSelectedId(submission)
      }
    } catch (err) {
      setMsg("Failed to load submission details")
      setMsgType("error")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  if (isGuest || !user) return null

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-10 md:pt-20 pb-10">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-semibold shadow cursor-pointer hover:bg-blue-100 transition w-fit"
          onClick={() => navigate(-1)}
        >
          <span className="w-5 h-5">←</span>Back
        </div>

        {msg && (
          <div
            className={`mb-4 px-4 py-3 rounded border ${
              msgType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="rounded-2xl shadow-lg bg-white border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 pt-6 pb-2">
            <h2 className="font-bold text-2xl sm:text-3xl text-blue-800 mb-2 sm:mb-0">My Survey Submissions</h2>
            <span className="text-gray-500 text-sm">
              {submissions.length > 0 && `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="px-4 sm:px-8 pt-4 pb-8">
            {loading ? (
              <div className="text-center py-8 text-blue-700 font-semibold">Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center text-gray-400 py-12 font-semibold">
                <p>No submissions yet.</p>
                <p className="text-sm mt-2">Submit a survey to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Submission #{submission.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 sm:mt-0 ${statusColors[submission.status] || statusColors.default}`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Client Type:</span>
                        <p className="font-medium text-gray-900">{submission.client_type || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <p className="font-medium text-gray-900">{submission.gender || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Region:</span>
                        <p className="font-medium text-gray-900">{submission.region || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Satisfaction:</span>
                        <p className="font-medium text-gray-900">
                          {submission.average_satisfaction
                            ? Number.parseFloat(submission.average_satisfaction).toFixed(1)
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleViewDetails(submission.id)}
                        className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 font-semibold text-sm transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(submission.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 font-semibold text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-6">
              You can edit or delete your submissions. Login required. Guest submissions cannot be edited.
            </p>
          </div>
        </div>

        {/* View Details Modal */}
        {selectedId && typeof selectedId === 'object' && selectedId.id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Submission Details</h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div><strong>ID:</strong> {selectedId.id}</div>
                <div><strong>Name:</strong> {selectedId.user_name || "Guest"}</div>
                <div><strong>Client Type:</strong> {selectedId.client_type || "—"}</div>
                <div><strong>Gender:</strong> {selectedId.gender || "—"}</div>
                <div><strong>Age:</strong> {selectedId.age || "—"}</div>
                <div><strong>Region:</strong> {selectedId.region || "—"}</div>
                <div><strong>Service:</strong> {selectedId.service || "—"}</div>
                <div><strong>Average Satisfaction:</strong> {selectedId.average_satisfaction ? Number.parseFloat(selectedId.average_satisfaction).toFixed(2) : "—"}</div>
                <div><strong>Submitted:</strong> {new Date(selectedId.submitted_at).toLocaleString()}</div>
                {selectedId.response_data && (
                  <div className="mt-4">
                    <strong>Full Response Data:</strong>
                    <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto">
                      {JSON.stringify(selectedId.response_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
