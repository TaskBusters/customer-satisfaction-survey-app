"use client"

import { useState } from "react"
import { API_BASE_URL } from "../../utils/api.js"
import { HiEye, HiEyeOff } from "react-icons/hi"

export default function CreateAdminModal({ open, onClose, onSave, loading }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "surveyadmin",
  })

  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendVerificationCode = async () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Generate code first
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
    setSentCode(generatedCode)
    setPopupMessage(`Verification Code: ${generatedCode}\n\nSend to email or proceed with code`)
    setShowSuccessPopup(true)

    // Attempt to send email in background
    try {
      const emailRes = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          code: generatedCode,
        }),
      })

      if (emailRes.ok) {
        setPopupMessage(
          `Verification code sent to ${formData.email}!\n\nCheck your email or use the code below: ${generatedCode}`,
        )
      }
    } catch (err) {
      console.error("Email send error:", err)
    }

    setStep(2)
    setTimeout(() => setShowSuccessPopup(false), 4000)
  }

  const handleVerifyEmail = () => {
    if (verificationCode !== sentCode) {
      setErrors({ verificationCode: "Verification code is incorrect" })
      return
    }
    setStep(3)
    setErrors({})
  }

  const handleFinalSubmit = async () => {
    if (!validateForm()) return
    await onSave(formData)

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "surveyadmin",
    })

    setErrors({})
    setStep(1)
    setVerificationCode("")
    setSentCode("")
  }

  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "surveyadmin",
    })
    setErrors({})
    setStep(1)
    setVerificationCode("")
    setSentCode("")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      {showSuccessPopup && step === 2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Your Verification Code</h3>
            <p className="text-sm text-gray-600 text-center mb-4">Email verification required. Here's your code:</p>
            <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
              <p className="text-4xl font-bold tracking-widest text-blue-600">{sentCode}</p>
            </div>
            <p className="text-xs text-gray-500 text-center mb-6">Code expires in 24 hours</p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    const emailRes = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: formData.email,
                        fullName: formData.fullName,
                        code: sentCode,
                      }),
                    })

                    if (emailRes.ok) {
                      setPopupMessage("Verification code sent to " + formData.email)
                    } else {
                      setPopupMessage("Could not send email, but you can still use the code")
                    }
                    setShowSuccessPopup(false)
                  } catch (err) {
                    setPopupMessage("Email unavailable, use the code shown above")
                    setShowSuccessPopup(false)
                  }
                }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition"
              >
                Send Code to Email
              </button>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition"
              >
                Proceed with Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
        <h2 className="font-bold mb-4 text-lg">Create New Admin Account</h2>

        {/* STEP 1 — Enter Details */}
        {step === 1 && (
          <>
            <div className="space-y-3 mb-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  disabled={loading}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className={`w-full border rounded px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border rounded px-3 py-2 pr-10 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full border rounded px-3 py-2 pr-10 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-1">Admin Role</label>
                <select
                  className="w-full border rounded px-3 py-2 border-gray-300"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="surveyadmin">Survey Administrator</option>
                  <option value="analyst">Analyst / Report Viewer</option>
                  <option value="support">Support / Feedback Manager</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                onClick={handleSendVerificationCode}
                disabled={loading}
              >
                Send Verification Code
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Verify Code */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              A verification code has been sent to <strong>{formData.email}</strong>
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Verification Code</label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 text-center text-2xl tracking-widest ${
                    errors.verificationCode ? "border-red-500" : "border-gray-300"
                  }`}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />

                {errors.verificationCode && <p className="text-xs text-red-600 mt-1">{errors.verificationCode}</p>}

                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to the email</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setStep(1)
                  setVerificationCode("")
                  setSentCode("")
                  setErrors({})
                }}
                disabled={loading}
              >
                Back
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                onClick={handleVerifyEmail}
                disabled={loading}
              >
                Verify Code
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — Confirm */}
        {step === 3 && (
          <>
            <p className="text-sm text-gray-600 mb-4">Email verified! Now create the admin account.</p>

            <div className="space-y-3 mb-4">
              <p className="text-sm">
                <strong>Full Name:</strong> {formData.fullName}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {formData.email}
              </p>
              <p className="text-sm">
                <strong>Role:</strong> {formData.role}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50"
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
