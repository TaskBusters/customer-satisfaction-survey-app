"use client"

import { useEffect, useRef, useState } from "react"
import { HiX, HiUser, HiGlobe, HiOutlineAdjustments, HiArrowLeft } from "react-icons/hi"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { API_BASE_URL } from "../../utils/api.js"
import DeleteUserAccountModal from "./DeleteUserAccountModal"

function AboutContent() {
  const [aboutText, setAboutText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        setAboutText(data.about || "Customer Satisfaction Survey System")
        setLoading(false)
      })
      .catch(() => {
        setAboutText("Customer Satisfaction Survey System")
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-gray-700 text-sm">Loading...</p>

  return (
    <div className="text-gray-700 text-sm whitespace-pre-line">
      {aboutText.split("\n").map((line, idx) => (
        <p key={idx} className="mb-2">
          {line}
        </p>
      ))}
    </div>
  )
}

export default function UserSettingsModal({ open, onClose }) {
  const { user, isGuest, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const cardRef = useRef()
  const [activeSub, setActiveSub] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [textSize, setTextSize] = useState("normal")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (!open) return
    const savedTextSize = localStorage.getItem("textSize") || "normal"
    setTextSize(savedTextSize)
    applyTextSize(savedTextSize)
    const savedLang = localStorage.getItem("i18nextLng") || "en"
    i18n.changeLanguage(savedLang)
  }, [open, i18n])

  const applyTextSize = (size) => {
    const root = document.documentElement
    if (size === "small") {
      root.style.fontSize = "14px"
    } else if (size === "large") {
      root.style.fontSize = "18px"
    } else {
      root.style.fontSize = "16px"
    }
    localStorage.setItem("textSize", size)
    setTextSize(size)
  }

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => document.body.classList.remove("overflow-hidden")
  }, [open])

  useEffect(() => {
    if (!open) {
      setShowDeleteModal(false)
      setActiveSub(null)
      setShowLoginPrompt(false)
    }
  }, [open])

  function handleBackdropClick(e) {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose()
    }
  }

  if (!open) return null

  const settingsItems = [
    {
      label: t("common.language"),
      icon: <HiGlobe className="text-xl mr-3 text-blue-600" />,
      value: "language",
      requiresLogin: false,
    },
    {
      label: t("common.textSize"),
      icon: <HiOutlineAdjustments className="text-xl mr-3 text-blue-600" />,
      value: "textSize",
      requiresLogin: false,
    },
    ...(isGuest
      ? []
      : [
          {
            label: t("common.profile"),
            icon: <HiUser className="text-xl mr-3 text-blue-600" />,
            value: "profile",
            requiresLogin: false,
          },
        ]),
  ]

  const handleProfileClick = () => {
    if (isGuest) {
      setShowLoginPrompt(true)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-center items-center min-h-screen"
        onMouseDown={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>

        <div
          ref={cardRef}
          className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-blue-600 my-auto"
          style={{
            animation: "popupIn .35s cubic-bezier(0.53, 1.87, 0.58, 1)",
          }}
        >
          <div className="flex items-center px-4 py-4 border-b bg-blue-50 rounded-t-2xl">
            <span className="mx-auto text-lg font-bold text-blue-700 tracking-wide">{t("common.settings")}</span>
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-blue-700 hover:bg-blue-100 rounded-full p-2 transition"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {!activeSub ? (
            <ul className="flex flex-col gap-1 my-4 px-3">
              {settingsItems.map((item) => {
                const isDisabled = item.requiresLogin && isGuest
                return (
                  <li key={item.value}>
                    <button
                      disabled={isDisabled}
                      className={`w-full flex items-center px-4 py-4 rounded-lg font-medium transition-colors border-b border-blue-100 last:border-b-0 focus:outline-none
                        ${
                          isDisabled
                            ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                            : "text-blue-800 bg-blue-50 hover:bg-blue-100 hover:shadow"
                        }`}
                      onClick={() => !isDisabled && setActiveSub(item.value)}
                    >
                      {item.icon}
                      <span className="flex-grow text-left">{item.label}</span>
                      {isDisabled && <span className="text-xs text-gray-500">({t("common.login")})</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-6 flex flex-col gap-4">
              <button
                onClick={() => setActiveSub(null)}
                className="flex items-center px-3 py-2 rounded-lg font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 transition w-fit"
              >
                <HiArrowLeft className="text-xl mr-2 text-blue-600" />
                {t("common.back")}
              </button>

              {activeSub === "language" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold">{t("common.language")}</h2>
                  <select
                    value={i18n.language}
                    onChange={(e) => {
                      i18n.changeLanguage(e.target.value)
                      localStorage.setItem("i18nextLng", e.target.value)
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="en">English</option>
                    <option value="fil">Filipino</option>
                  </select>
                </>
              )}

              {activeSub === "textSize" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold">{t("common.textSize")}</h2>
                  <div className="space-y-2">
                    {["small", "normal", "large"].map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="radio"
                          name="textSize"
                          value={size}
                          checked={textSize === size}
                          onChange={(e) => applyTextSize(e.target.value)}
                          className="mr-2"
                        />
                        <span
                          className={`capitalize ${size === "small" ? "text-sm" : size === "large" ? "text-lg" : ""}`}
                        >
                          {t(`textSize.${size}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("textSize", textSize)
                      setActiveSub(null)
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    {t("common.save")}
                  </button>
                </>
              )}

              {activeSub === "profile" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold">{t("common.profile")}</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{user?.fullName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{user?.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-col">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Delete Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">{t("common.profile")}</h2>
              <p className="text-gray-600 mb-6">{t("common.login")} to access your profile settings.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false)
                    onClose()
                    navigate("/login")
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {t("common.login")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteUserAccountModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          onClose()
        }}
      />

      <style>{`
        @keyframes popupIn {
          0% { transform: translateY(40px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
