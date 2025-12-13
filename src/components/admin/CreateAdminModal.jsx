import { useState } from "react"
import { API_BASE_URL } from "../../utils/api.js"
import { HiEye, HiEyeOff } from "react-icons/hi"

export default function CreateAdminModal({ open, onClose, onSave, loading, currentUser }) {
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
  const [showCodePopup, setShowCodePopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [canSendCode, setCanSendCode] = useState(true)
  const [cooldownTime, setCooldownTime] = useState(0)

  const allowedProviders = [
    "@yahoo.com.ph",
    "@ymail.com",
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com",
    "@live.com",
    "@icloud.com",
    "@protonmail.com",
    "@aol.com",
    "@mail.com",
    "@zoho.com",
    "@yandex.com",
    "@gmx.com",
    "@tutanota.com",
    "@fastmail.com",
  ]

  const allowedDomains = [".com", ".net", ".org", ".gov", ".gov.ph", ".mil", ".int"]

  const validateEmail = (email) => {
    if (!email) return { valid: false, message: "Email is required" }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Invalid email format" }
    }

    const hasValidProvider = allowedProviders.some((provider) => email.toLowerCase().endsWith(provider))
    if (hasValidProvider) {
      return { valid: true, message: "" }
    }

    const hasValidDomain = allowedDomains.some((domain) => email.toLowerCase().includes(domain))
    if (!hasValidDomain) {
      return { valid: false, message: "Email domain not allowed" }
    }

    return { valid: true, message: "" }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message
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
    if (!canSendCode) {
      setErrors({ general: `Please wait ${cooldownTime} seconds before sending another code.` })
      return
    }

    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message
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

    try {
      const checkResponse = await fetch(`${API_BASE_URL}/api/auth/admin/create-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          createdBy: currentUser?.email,
          createdByRole: currentUser?.role,
        }),
      })

      const checkData = await checkResponse.json()

      if (checkResponse.status === 409) {
        // Email already registered with active account
        setErrors({ email: checkData.message || "Email already registered with an active account" })
        return
      }

      if (!checkResponse.ok) {
        setErrors({ general: checkData.message || "Failed to validate account. Please try again." })
        return
      }
    } catch (err) {
      console.error("Validation error:", err)
      setErrors({ general: "Failed to validate account. Please try again." })
      return
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
    setSentCode(generatedCode)
    setShowCodePopup(true)

    setCanSendCode(false)
    setCooldownTime(30)

    const cooldownInterval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval)
          setCanSendCode(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCodeToEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          code: sentCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ email: data.error || "Failed to send verification code" })
        return
      }

      // Show success and proceed to code input
      setShowCodePopup(false)
      setStep(2)
    } catch (err) {
      console.error("Email send error:", err)
      setErrors({ general: "Failed to send verification code. Please try again." })
    }
  }

  const handleProceedWithCode = () => {
    setShowCodePopup(false)
    setStep(2)
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

    const adminData = {
      ...formData,
      createdBy: currentUser?.email,
      createdByRole: currentUser?.role,
      verificationCode: sentCode,
    }

    try {
      const result = await onSave(adminData)

      if (result?.requiresApproval) {
        setPopupMessage("Account created successfully! Waiting for superadmin approval to activate the account.")
      } else {
        setPopupMessage("Admin account created and activated successfully!")
      }

      setShowSuccessPopup(true)
      setTimeout(() => {
        setShowSuccessPopup(false)
        onClose()
      }, 4000)
    } catch (error) {
      setErrors({ general: error.message || "Failed to create admin account" })
    }

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
    setShowCodePopup(false)
    setShowSuccessPopup(false)
    onClose()
  }

  if (!open) return null

  const emailValidationResult = validateEmail(formData.email)

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      {showCodePopup && sentCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Your Verification Code</h3>
            <p className="text-sm text-gray-600 text-center mb-6">Email verification required. Here's your code:</p>

            {/* Large code display */}
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <div className="text-5xl font-bold text-blue-600 text-center tracking-wider">{sentCode}</div>
            </div>

            <p className="text-sm text-gray-500 text-center mb-6">Code expires in 30 seconds</p>

            <div className="space-y-3">
              <button
                onClick={handleSendCodeToEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Send Code to Email
              </button>
              <button
                onClick={handleProceedWithCode}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Proceed with Code
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{popupMessage}</p>
            </div>
            <button
              onClick={() => {
                setShowSuccessPopup(false)
                handleClose()
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Close
            </button>
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
                  className={`w-full border rounded px-3 py-2 ${
                    errors.email || (formData.email && !emailValidationResult.valid)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                {!errors.email && formData.email && !emailValidationResult.valid && (
                  <p className="text-xs text-red-600 mt-1">{emailValidationResult.message}</p>
                )}
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
                disabled={loading || !canSendCode}
              >
                {!canSendCode ? `Wait ${cooldownTime}s` : "Send Verification Code"}
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
