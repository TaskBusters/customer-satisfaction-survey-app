"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import NotificationBar from "../../components/admin/NotificationBar"
import { API_BASE_URL } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext"
import { logAdminAction } from "../../utils/adminLogger"
import { canManageFeedback } from "../../utils/roleUtils"

function FAQModal({ open, onClose, onSave, user, canEdit = true }) {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingFaq, setEditingFaq] = useState(null)
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "" })

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${API_BASE_URL}/api/admin/faqs`)
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open])

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      })
      
      if (res.ok) {
        await logAdminAction(user.email, user.fullName, `Added new FAQ: "${newFaq.question}"`)
        const data = await fetch(`${API_BASE_URL}/api/admin/faqs`).then((r) => r.json())
        setFaqs(data)
        setNewFaq({ question: "", answer: "", category: "" })
        
        // Trigger reload in dashboard
        window.dispatchEvent(new CustomEvent('reloadLogs'))
      }
    } catch (err) {
      console.error("Failed to add FAQ:", err)
    }
  }

  const handleSaveFaq = async (faqId) => {
    if (!editingFaq) return
    try {
      const oldFaq = faqs.find(f => f.id === faqId)
      const res = await fetch(`${API_BASE_URL}/api/admin/faqs/${faqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFaq),
      })
      
      if (res.ok) {
        await logAdminAction(user.email, user.fullName, `Edited FAQ: "${oldFaq?.question || 'FAQ'}" → "${editingFaq.question}"`)
        setFaqs(faqs.map((f) => (f.id === faqId ? editingFaq : f)))
        setEditingId(null)
        setEditingFaq(null)
        
        // Trigger reload in dashboard
        window.dispatchEvent(new CustomEvent('reloadLogs'))
      }
    } catch (err) {
      console.error("Failed to save FAQ:", err)
    }
  }

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return
    try {
      const faqToDelete = faqs.find(f => f.id === id)
      const res = await fetch(`${API_BASE_URL}/api/admin/faqs/${id}`, { method: "DELETE" })
      
      if (res.ok) {
        await logAdminAction(user.email, user.fullName, `Deleted FAQ: "${faqToDelete?.question || 'FAQ'}"`)
        setFaqs(faqs.filter((f) => f.id !== id))
        
        // Trigger reload in dashboard
        window.dispatchEvent(new CustomEvent('reloadLogs'))
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Manage FAQs</h2>

        {loading ? (
          <p>Loading FAQs...</p>
        ) : (
          <>
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Add New FAQ</h3>
              <input
                type="text"
                placeholder="Question"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-2"
              />
              <textarea
                placeholder="Answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-2 h-24"
              />
              <input
                type="text"
                placeholder="Category"
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <button
                onClick={handleAddFaq}
                disabled={!canEdit}
                className={`px-4 py-2 bg-green-600 text-white rounded font-semibold transition ${
                  canEdit ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed"
                }`}
              >
                Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded p-4 bg-white">
                  {editingId === faq.id && editingFaq ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        className="w-full border rounded px-3 py-2 h-20 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveFaq(faq.id)}
                          disabled={!canEdit}
                          className={`px-3 py-1 text-sm bg-blue-600 text-white rounded transition ${
                            canEdit ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditingFaq(null)
                          }}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                      <p className="text-gray-700 mt-2 text-sm">{faq.answer}</p>
                      {faq.category && <p className="text-xs text-gray-500 mt-2">Category: {faq.category}</p>}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setEditingId(faq.id)
                            setEditingFaq(faq)
                          }}
                          disabled={!canEdit}
                          className={`px-3 py-1 text-sm border rounded transition ${
                            canEdit
                              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          disabled={!canEdit}
                          className={`px-3 py-1 text-sm border rounded transition ${
                            canEdit
                              ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminHelpFeedbackPage() {
  const { user } = useAuth()
  const canEdit = canManageFeedback(user?.role)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [msgType, setMsgType] = useState("success")
  const [faqModalOpen, setFaqModalOpen] = useState(false)

  const reloadFeedback = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/help-feedback`)
      const data = await res.json()
      setFeedback(data || [])
    } catch (err) {
      console.error("Failed to reload feedback:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/admin/help-feedback`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch feedback")
        }
        return res.json()
      })
      .then((data) => {
        setFeedback(data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching feedback:", err)
        setFeedback([])
        setLoading(false)
      })
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const feedbackItem = feedback.find(f => f.id === id)
      const res = await fetch(`${API_BASE_URL}/api/admin/help-feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        setFeedback(feedback.map((f) => (f.id === id ? { ...f, status: newStatus } : f)))
        await logAdminAction(user.email, user.fullName, `Updated feedback status from ${feedbackItem?.status || 'New'} to ${newStatus} for feedback ID ${id}`)
        await reloadFeedback()
        setMessage("Feedback status updated")
        setMsgType("success")
        setTimeout(() => setMessage(""), 3000)
        
        // Trigger reload in dashboard
        window.dispatchEvent(new CustomEvent('reloadLogs'))
      } else {
        throw new Error("Failed to update feedback")
      }
    } catch (err) {
      setMessage("Failed to update feedback")
      setMsgType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Help & Feedback</h1>
            <p className="text-gray-600 mt-1">Manage user feedback and FAQs</p>
          </div>
          <button
            onClick={() => setFaqModalOpen(true)}
            disabled={!canEdit}
            className={`px-4 py-2 bg-blue-600 text-white rounded font-semibold transition ${
              canEdit ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Manage FAQs
          </button>
        </div>

        <NotificationBar message={message} onClear={() => setMessage("")} msgType={msgType} />

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="font-semibold text-gray-900">User Feedback</p>
            <p className="text-sm text-gray-600 mt-1">
              {feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No feedback yet. User feedback will appear here.</div>
          ) : (
            <div className="divide-y">
              {feedback.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{item.user_name || "Guest User"}</h3>
                        <span className="text-xs text-gray-500">({item.feedback_type || "General"})</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.message}</p>
                      {item.user_email && <p className="text-xs text-gray-500 mt-2">Email: {item.user_email}</p>}
                      <p className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <select
                      value={item.status || "New"}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      disabled={!canEdit}
                      className={`ml-4 px-3 py-1 border rounded text-sm font-medium ${
                        !canEdit ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FAQModal open={faqModalOpen} onClose={() => setFaqModalOpen(false)} user={user} canEdit={canEdit} />
      </main>
    </div>
  )
}
