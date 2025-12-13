import { useRef, useState } from "react"
import { HiX } from "react-icons/hi"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { API_BASE_URL } from "../../utils/api.js"

export default function DeleteUserAccountModal({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const cardRef = useRef()
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      alert("Error: No email found for user")
      return
    }

    setDeletingAccount(true)

    console.log("[v0] Attempting to delete account for:", user.email)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      let data
      try {
        const text = await response.text()
        console.log("[v0] Response text:", text)
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("[v0] Failed to parse response:", parseError)
        data = {}
      }

      if (!response.ok) {
        console.error("[v0] Delete failed:", data)
        alert("Failed to delete account: " + (data.error || data.message || "Unknown error"))
        setDeletingAccount(false)
        return
      }

      console.log("[v0] Account deleted successfully")
      setDeletingAccount(false)

      alert("Account deleted successfully")
      logout()
      onClose()
      setTimeout(() => navigate("/login"), 100)
    } catch (error) {
      console.error("[v0] Delete account error:", error)
      setDeletingAccount(false)
      alert("Failed to delete account: " + error.message)
    }
  }

  function handleBackdropClick(e) {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-center items-center min-h-screen"
        onMouseDown={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>

        <div
          ref={cardRef}
          className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-red-600 my-auto"
          style={{
            animation: "popupIn .35s cubic-bezier(0.53, 1.87, 0.58, 1)",
          }}
        >
          <div className="flex items-center px-4 py-4 border-b bg-red-50 rounded-t-2xl">
            <span className="mx-auto text-lg font-bold text-red-700 tracking-wide">Delete Account</span>
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-red-700 hover:bg-red-100 rounded-full p-2 transition"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-2">Are you sure you want to delete your account?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Your account will be permanently deleted, but your survey submissions will
              remain in the system.
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex gap-3 justify-end rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={deletingAccount}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          0% { transform: translateY(40px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
