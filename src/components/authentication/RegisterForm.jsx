import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiEye, HiEyeOff } from "react-icons/hi"
import Logo from "./Logo"
import { useAuth } from "../../context/AuthContext"
import { Toast } from "flowbite-react"
import { API_BASE_URL } from "../../utils/api.js" // import API_BASE_URL

function checkPasswordStrength(password) {
  if (password.length < 8) return "too short"
  if (!/[a-z]/.test(password)) return "no lowercase"
  if (!/[A-Z]/.test(password)) return "no uppercase"
  if (!/[0-9]/.test(password)) return "no number"
  if (!/[^A-Za-z0-9]/.test(password)) return "no symbol"
  return "strong"
}
function getStrengthLabel(strength) {
  switch (strength) {
    case "too short":
      return "Password must be at least 8 characters"
    case "no lowercase":
      return "Add a lowercase letter"
    case "no uppercase":
      return "Add an uppercase letter"
    case "no number":
      return "Add a number"
    case "no symbol":
      return "Add a symbol"
    case "strong":
      return "Strong password"
    default:
      return ""
  }
}
function getStrengthColor(strength) {
  switch (strength) {
    case "too short":
    case "no lowercase":
    case "no uppercase":
    case "no number":
    case "no symbol":
      return "text-red-600"
    case "strong":
      return "text-green-600"
    default:
      return ""
  }
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [district, setDistrict] = useState("")
  const [fullName, setFullName] = useState("")
  const [barangay, setBarangay] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white")
  const [registrationStep, setRegistrationStep] = useState("form") // "form" or "verify"
  const [verificationCode, setVerificationCode] = useState("")
  const [tempEmail, setTempEmail] = useState("")
  const [showCodePopup, setShowCodePopup] = useState(false)
  const [popupCode, setPopupCode] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const showToastWithDelay = (message, color, callback) => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      if (callback) callback()
    }, 2000)
  }

  const districts = [
    {
      value: "district1",
      label: "District 1",
      barangays: [
        { value: "arkongBato", label: "Arkong Bato" },
        { value: "balangkas", label: "Balangkas" },
        { value: "bignay", label: "Bignay" },
        { value: "bisig", label: "Bisig" },
        { value: "canumayEast", label: "Canumay East" },
        { value: "canumayWest", label: "Canumay West" },
        { value: "coloong", label: "Coloong" },
        { value: "dalandanan", label: "Dalandanan" },
        { value: "isla", label: "Isla" },
        { value: "lawangBato", label: "Lawang Bato" },
        { value: "lingunan", label: "Lingunan" },
        { value: "mabolo", label: "Mabolo" },
        { value: "malanday", label: "Malanday" },
        { value: "malinta", label: "Malinta" },
        { value: "palasan", label: "Palasan" },
        { value: "pariancilloVilla", label: "Pariancillo Villa" },
        { value: "pasolo", label: "Pasolo" },
        { value: "poblacion", label: "Poblacion" },
        { value: "polo", label: "Polo" },
        { value: "punturin", label: "Punturin" },
        { value: "rincon", label: "Rincon" },
        { value: "tagalag", label: "Tagalag" },
        { value: "veinteReales", label: "Veinte Reales" },
        { value: "wawangPulo", label: "Wawang Pulo" },
      ],
    },
    {
      value: "district2",
      label: "District 2",
      barangays: [
        { value: "bagbaguin", label: "Bagbaguin" },
        { value: "genTDeLeon", label: "Gen. T. de Leon" },
        { value: "karuhatan", label: "Karuhatan" },
        { value: "mapulangLupa", label: "Mapulang Lupa" },
        { value: "marulas", label: "Marulas" },
        { value: "maysan", label: "Maysan" },
        { value: "parada", label: "Parada" },
        { value: "pasoDeBlas", label: "Paso de Blas" },
        { value: "ugong", label: "Ugong" },
      ],
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword || !district || !barangay || !fullName) {
      showToastWithDelay("Please fill out all fields.", "bg-red-600/90 text-white")
      return
    }
    const passStrength = checkPasswordStrength(password)
    if (passStrength !== "strong") {
      showToastWithDelay("Password is not strong: " + getStrengthLabel(passStrength), "bg-red-600/90 text-white")
      return
    }
    if (password !== confirmPassword) {
      showToastWithDelay("Passwords do not match.", "bg-red-600/90 text-white")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          district,
          barangay,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setPopupCode(data.code)
        setShowCodePopup(true)
        setTempEmail(email)
        setRegistrationStep("verify")
        showToastWithDelay("Registration successful! Your verification code is ready.", "bg-green-500/90 text-white")
      } else {
        showToastWithDelay(data?.error || "Registration failed", "bg-red-600/90 text-white")
      }
    } catch (err) {
      showToastWithDelay("Registration failed", "bg-red-600/90 text-white")
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    if (!verificationCode) {
      showToastWithDelay("Please enter the verification code.", "bg-red-600/90 text-white")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempEmail,
          code: verificationCode,
        }),
      })

      if (res.ok) {
        login({ email: tempEmail, fullName, district, barangay })
        showToastWithDelay("Email verified! Welcome aboard!", "bg-green-500/90 text-white", () => navigate("/"))
      } else {
        const data = await res.json()
        showToastWithDelay(data?.error || "Verification failed", "bg-red-600/90 text-white")
      }
    } catch (err) {
      showToastWithDelay("Verification failed", "bg-red-600/90 text-white")
    }
  }

  const handleSendEmailConfirm = async () => {
    setIsSendingEmail(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, code: popupCode }),
      })

      if (res.ok) {
        setToastMessage("Verification code sent to your email!")
        setToastColor("bg-green-500/90 text-white")
      } else {
        setToastMessage("Email sending unavailable, but you can still use the code above")
        setToastColor("bg-yellow-500/90 text-white")
      }
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setToastMessage("Email unavailable, use the code shown")
      setToastColor("bg-yellow-500/90 text-white")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setIsSendingEmail(false)
    }
  }

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
    if (!email) return { valid: false, message: "Please enter your email" }

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

  const emailValidation = validateEmail(email)
  const passwordStrength = checkPasswordStrength(password)

  if (registrationStep === "verify") {
    return (
      <div
        className="bg-[#F4F4F4] rounded-lg shadow-2xl
          w-full max-w-xl
          mx-auto
          p-8 sm:p-10
          text-base
          border-3 border-gray-200
          min-h-[400px]"
      >
        {showToast && (
          <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
            <Toast className={`${toastColor} shadow-xl`}>
              <span className="font-semibold">{toastMessage}</span>
            </Toast>
          </div>
        )}

        {showCodePopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Your Verification Code</h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Registration successful! Here's your verification code:
              </p>
              <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
                <p className="text-4xl font-bold tracking-widest text-blue-600">{popupCode}</p>
              </div>
              <p className="text-xs text-gray-500 text-center mb-6">Code expires in 30 seconds</p>

              <div className="space-y-3">
                <button
                  onClick={handleSendEmailConfirm}
                  disabled={isSendingEmail}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                >
                  {isSendingEmail ? "Sending..." : "Send Code to Email"}
                </button>
                <button
                  onClick={() => setShowCodePopup(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition"
                >
                  Proceed with Code
                </button>
              </div>
            </div>
          </div>
        )}

        <Logo />
        <h2 className="text-xl text-center font-bold text-gray-800 mb-4">Verify Your Email</h2>
        <p className="text-center text-gray-600 mb-6">
          We sent a 6-digit verification code to <strong>{tempEmail}</strong>
        </p>

        <form className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto" onSubmit={handleVerifyEmail}>
          <div className="mb-5">
            <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="000000"
              maxLength="6"
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 text-center text-2xl tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block w-32 sm:w-40 md:w-48"
          >
            Verify Email
          </button>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setRegistrationStep("form")}
              className="text-blue-500 hover:underline text-sm"
            >
              Back to Register
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div
      className="bg-[#F4F4F4] rounded-lg shadow-2xl
        w-full max-w-xl
        mx-auto
        p-8 sm:p-10
        text-base
        border-3 border-gray-200
        min-h-[400px]"
    >
      {showToast && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <Toast className={`${toastColor} shadow-xl`}>
            <span className="font-semibold">{toastMessage}</span>
          </Toast>
        </div>
      )}

      <Logo />
      <h2 className="text-xl text-center font-bold text-gray-800">Register a New Account</h2>

      <form className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-5">
          <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
          />
        </div>
        {/* Email */}
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className={`bg-gray-50 border ${
              email && !emailValidation.valid ? "border-red-500" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400`}
          />
          {email && !emailValidation.valid && (
            <span className="text-xs text-red-500 mt-1 block">{emailValidation.message}</span>
          )}
        </div>
        {/* Password */}
        <div className="mb-1 relative">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 placeholder-gray-400"
          />
          {/* Eye icon toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
          >
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
        </div>
        {/* Password strength checker */}
        <div className="mb-4">
          <span className={`block text-xs mt-1 ${getStrengthColor(passwordStrength)}`}>
            {password ? getStrengthLabel(passwordStrength) : ""}
          </span>
        </div>
        {/* Confirm Password */}
        <div className="mb-5">
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 placeholder-gray-400"
              autoComplete="new-password"
            />
            {/* Eye icon toggle */}
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={0}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              style={{ top: 0, bottom: 0, height: "100%" }}
            >
              {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
            </button>
          </div>
          {/* Password match checker */}
          <div className="mt-2 h-4">
            {confirmPassword && (
              <span className={`text-xs ${password === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
              </span>
            )}
          </div>
        </div>
        {/* District dropdown */}
        <div className="mb-5">
          <label htmlFor="district" className="block mb-2 text-sm font-medium text-gray-900">
            District
          </label>
          <select
            id="district"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value)
              setBarangay("")
            }}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">Select your district</option>
            {districts.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        {/* Barangay dropdown */}
        <div className="mb-5">
          <label htmlFor="barangay" className="block mb-2 text-sm font-medium text-gray-900">
            Barangay
          </label>
          <select
            id="barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            required
            disabled={!district}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">{district ? "Select your Barangay" : "Select a District first"}</option>
            {district &&
              districts
                .find((d) => d.value === district)
                ?.barangays.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
          </select>
        </div>
        <div className="flex items-center justify-between mb-5">
          <Link to="/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
          <Link to="/" className="text-blue-500 hover:underline">
            Continue as Guest
          </Link>
        </div>
        {/* Register button */}
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block w-32 sm:w-40 md:w-48"
        >
          Register
        </button>
      </form>
    </div>
  )
}
