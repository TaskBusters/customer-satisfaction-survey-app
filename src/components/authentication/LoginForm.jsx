"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiEye, HiEyeOff } from "react-icons/hi"
import Logo from "./Logo"
import { useAuth } from "../../context/AuthContext"
import { Toast } from "flowbite-react"
import { GoogleLogin } from "@react-oauth/google"
import { useLocation } from "react-router-dom"
import { API_BASE_URL } from "../../utils/api.js" // import API_BASE_URL

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white")
  const [googleSigningIn, setGoogleSigningIn] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const next = params.get("next")
  const messageParam = params.get("message")
  const [redirectMessage, setRedirectMessage] = useState(() => {
    if (!messageParam) return ""
    try {
      return decodeURIComponent(messageParam)
    } catch (e) {
      return messageParam
    }
  })

  const showToastWithDelay = (message, color, callback) => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      if (callback) callback()
    }, 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToastWithDelay("Please enter both email and password", "bg-red-600/90 text-white")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const user = await res.json()
        login(user)

        showToastWithDelay("Login successful!", "bg-green-500/90 text-white", () => {
          // If there is an intended 'next' path (from ProtectedRoute), honor it.
          if (next) {
            try {
              const decoded = decodeURIComponent(next)
              navigate(decoded, { replace: true })
              return
            } catch (e) {
              // fall back if invalid
            }
          }

          if (user.isAdmin) {
            navigate("/admin/overview", { replace: true })
          } else {
            navigate("/", { replace: true })
          }
        })
      } else {
        const err = await res.json()
        showToastWithDelay(err?.error || "Login failed!", "bg-red-600/90 text-white")
      }
    } catch (error) {
      showToastWithDelay("Network error. Please try again.", "bg-red-600/90 text-white")
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        showToastWithDelay("Google login failed. Missing credential.", "bg-red-600/90 text-white")
        return
      }

      setGoogleSigningIn(true)

      const res = await fetch(`${API_BASE_URL}/api/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      if (res.ok) {
        const user = await res.json()
        login(user)

        showToastWithDelay("Signed in with Google!", "bg-green-500/90 text-white", () => {
          if (next) {
            try {
              const decoded = decodeURIComponent(next)
              navigate(decoded, { replace: true })
              return
            } catch (e) {}
          }

          if (user.isAdmin) {
            navigate("/admin/overview", { replace: true })
          } else {
            navigate("/", { replace: true })
          }
        })
      } else {
        const err = await res.json()
        showToastWithDelay(err?.error || "Google login failed", "bg-red-600/90 text-white")
      }
    } catch (error) {
      showToastWithDelay("Google login failed. Please try again.", "bg-red-600/90 text-white")
    } finally {
      setGoogleSigningIn(false)
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

  return (
    <div className="bg-[#F4F4F4] rounded-lg shadow-2xl w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem] p-8 sm:p-8 md:p-10 text-sm md:text-base border-3 border-gray-200">
      {showToast && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <Toast className={`${toastColor} shadow-xl`}>
            <span className="font-semibold">{toastMessage}</span>
          </Toast>
        </div>
      )}

      <Logo />

      {redirectMessage && (
        <div className="mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex items-start justify-between">
              <div className="text-sm text-yellow-700">{redirectMessage}</div>
              <button
                type="button"
                onClick={() => setRedirectMessage("")}
                className="text-yellow-700 font-bold ml-4"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl text-center font-bold text-gray-800">Welcome, User!</h2>

      <form className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto" onSubmit={handleSubmit}>
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
        <div className="mb-5 relative">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
          >
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
        </div>

        {/* Register + Forgot */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/register" className="text-sm text-blue-700 hover:underline">
            Register now!
          </Link>

          <Link to="/forgot-password" className="text-sm text-blue-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Login */}
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block w-32 sm:w-40 md:w-48"
        >
          Login
        </button>

        {/* Google Login */}
        <div className="mt-6">
          <div className="flex items-center gap-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span className="flex-1 h-px bg-gray-300" />
            <span>or</span>
            <span className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToastWithDelay("Google login failed. Please try again.", "bg-red-600/90 text-white")}
              text="continue_with"
              shape="pill"
              size="large"
              width="280"
              logo_alignment="left"
              theme="outline"
              context="signin"
            />
          </div>

          {googleSigningIn && <p className="text-xs text-center text-gray-500 mt-2">Connecting to Google…</p>}
        </div>

        <p className="text-sm text-center mt-4">
          <Link to="/" className="text-blue-700 hover:underline">
            Continue as Guest
          </Link>
        </p>
      </form>
    </div>
  )
}
