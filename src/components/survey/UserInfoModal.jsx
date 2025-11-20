"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"

export default function UserInfoModal({ open, onSubmit, onCancel }) {
  const { user, isGuest } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ fullName, email })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Your Information</h2>
        <p className="text-gray-600 mb-6 text-sm">
          {isGuest
            ? "Please provide your information to submit the survey."
            : "Your profile information will be associated with your survey response."}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={isGuest}
              disabled={!isGuest}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
