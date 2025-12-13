import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"

// --- Configuration for Status Badge Colors ---
const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
}

export default function Submissions() {
  // --- Hooks and State Initialization ---
  const { user, isGuest } = useAuth() // Authentication context
  const navigate = useNavigate() // Navigation hook

  // Data states
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null) // Used for the "View Details" modal

  // Feedback/Message states
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState("success")

  // --- Side Effects (useEffect) ---

  // 1. Authentication Check and Data Fetching
  useEffect(() => {
    // Redirect unauthenticated guests
    if (isGuest) {
      navigate("/login", { replace: true })
      return
    }
    // Fetch data when the user object changes (i.e., after login)
    if (user && user.email) {
      fetchSubmissions()
    }
  }, [user, isGuest, navigate])

  // --- API Functions ---

  /**
   * Fetches the user's survey submissions from the API.
   */
  function fetchSubmissions() {
    if (!user || !user.email) return // Guard against missing user info

    setLoading(true)
    fetch(`${API_BASE_URL}/api/submissions/${user.email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submissions")
        return res.json()
      })
      .then((data) => {
        setSubmissions(data)
      })
      .catch((err) => {
        console.error("Fetch Submissions Error:", err)
        setSubmissions([])
        // Optionally show an error message
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // --- Event Handlers ---

  /**
   * Deletes a submission after confirmation.
   * @param {string | number} id - The ID of the submission to delete.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // Ensure the backend verifies the user.email for ownership
        body: JSON.stringify({ user_email: user.email }),
      })

      if (res.ok) {
        showFeedback("Submission deleted successfully", "success")
        fetchSubmissions() // Refresh the list
      } else {
        throw new Error("API delete failed")
      }
    } catch (err) {
      console.error("Delete Error:", err)
      showFeedback("Failed to delete submission", "error")
    }
  }

  /**
   * Navigates to the survey form for editing the selected submission.
   * @param {string | number} id - The ID of the submission to edit.
   */
  const handleEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/detail/${id}`)
      if (res.ok) {
        const submission = await res.json()
        // Navigate to the survey/edit route, passing data via state for pre-filling
        navigate(`/survey/edit/${id}`, { state: { submission } })
      } else {
        showFeedback("Failed to load submission for editing", "error")
      }
    } catch (err) {
      console.error("Edit Load Error:", err)
      showFeedback("Failed to load submission for editing", "error")
    }
  }

  /**
   * Loads the full details for a submission and opens the modal.
   * @param {string | number} id - The ID of the submission.
   */
  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/detail/${id}`)
      if (res.ok) {
        const submission = await res.json()
        setSelectedSubmission(submission) // Opens the modal
      } else {
        showFeedback("Failed to load submission details", "error")
      }
    } catch (err) {
      console.error("View Details Error:", err)
      showFeedback("Failed to load submission details", "error")
    }
  }

  /**
   * Helper function to set and clear messages.
   * @param {string} message - The message to display.
   * @param {"success" | "error"} type - The type of message.
   */
  function showFeedback(message, type) {
    setMsg(message)
    setMsgType(type)
    setTimeout(() => setMsg(""), 3000)
  }

  // --- Render Logic ---

  // Do not render if the user is a guest (redirection handled in useEffect)
  if (isGuest || !user) return null

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-10 md:pt-20 pb-10">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-semibold shadow cursor-pointer hover:bg-blue-100 transition w-fit"
          onClick={() => navigate("/aftersurvey")}
        >
          <span className="w-5 h-5">←</span>Back
        </div>

        {/* Success/Error Message Display */}
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

        {/* Submissions List Container */}
        <div className="rounded-2xl shadow-lg bg-white border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 pt-6 pb-2">
            <h2 className="font-bold text-2xl sm:text-3xl text-blue-800 mb-2 sm:mb-0">My Survey Submissions</h2>
            <span className="text-gray-500 text-sm">
              {submissions.length > 0 && `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="px-4 sm:px-8 pt-4 pb-8">
            {loading ? (
              // Loading State
              <div className="text-center py-8 text-blue-700 font-semibold">Loading...</div>
            ) : submissions.length === 0 ? (
              // Empty State
              <div className="text-center text-gray-400 py-12 font-semibold">
                <p>No submissions yet.</p>
                <p className="text-sm mt-2">Submit a survey to see it here.</p>
              </div>
            ) : (
              // Submissions List
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
                      {/* Status Badge */}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 sm:mt-0 ${
                          statusColors[submission.status] || statusColors.default
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                      {/* Using optional chaining for robustness */}
                      <SubmissionDetail label="Client Type" value={submission.client_type} />
                      <SubmissionDetail label="Gender" value={submission.gender} />
                      <SubmissionDetail label="Region" value={submission.region} />
                      <SubmissionDetail
                        label="Satisfaction"
                        value={
                          submission.average_satisfaction
                            ? Number.parseFloat(submission.average_satisfaction).toFixed(1)
                            : null
                        }
                      />
                    </div>

                    {/* Action Buttons */}
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
        {selectedSubmission && (
          <DetailsModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
        )}
      </div>
    </div>
  )
}

// --- Helper Component for Detail Items ---
const SubmissionDetail = ({ label, value }) => (
  <div>
    <span className="text-gray-500">{label}:</span>
    <p className="font-medium text-gray-900">{value || "—"}</p>
  </div>
)

// --- Dedicated Modal Component ---
const DetailsModal = ({ submission, onClose }) => {
  if (!submission) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Submission Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <DetailRow label="ID" value={submission.id} />
          <DetailRow label="Name" value={submission.user_name || "Guest"} />
          <DetailRow label="Client Type" value={submission.client_type} />
          <DetailRow label="Gender" value={submission.gender} />
          <DetailRow label="Age" value={submission.age} />
          <DetailRow label="Region" value={submission.region} />
          <DetailRow label="Service" value={submission.service} />
          <DetailRow
            label="Average Satisfaction"
            value={
              submission.average_satisfaction ? Number.parseFloat(submission.average_satisfaction).toFixed(2) : "—"
            }
          />
          <DetailRow label="Submitted" value={new Date(submission.submitted_at).toLocaleString()} />

          {submission.response_data && (
            <div className="mt-4">
              <strong>Full Response Data:</strong>
              <div className="mt-2">
                <ResponseDataViewer data={submission.response_data} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DetailRow = ({ label, value }) => (
  <div>
    <strong>{label}:</strong> {value || "—"}
  </div>
)

// Recursive viewer for response data to display label-value rows
const ResponseDataViewer = ({ data }) => {
  if (data === null || data === undefined) return <div className="text-sm text-gray-500">—</div>

  if (typeof data !== "object") {
    return <div className="text-sm text-gray-900">{String(data)}</div>
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="pl-3">
            <div className="text-xs text-gray-500 font-medium">Item {idx + 1}</div>
            <div className="pl-2">
              <ResponseDataViewer data={item} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1">
          <div className="w-full sm:w-1/3 text-gray-500 text-sm">{key}:</div>
          <div className="flex-1 text-sm text-gray-900">
            {value === null || value === undefined ? (
              "—"
            ) : typeof value === "object" ? (
              <div className="pl-2">
                <ResponseDataViewer data={value} />
              </div>
            ) : (
              String(value)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
