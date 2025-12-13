import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { HiCog, HiOutlineUserCircle, HiChevronUp, HiHome } from "react-icons/hi"
import UserSettingsModal from "./UserSettingsModal"
import { useAuth } from "../../context/AuthContext"
import GoVoiceLogo from "../../assets/GoVoiceFaviconLight.png"

const Navbar = ({ onClickHome, onClickLogin, onClickRegister, homeOverride }) => {
  const { user, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownTimeout = useRef()

  const navigate = useNavigate()
  const location = useLocation()

  const isSurveyHomePage = location.pathname === "/"
  const hideLogo = location.pathname.startsWith("/surveyform") || location.pathname === "/aftersurvey"
  const isAfterSurveyPage = location.pathname === "/aftersurvey"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout.current)
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate("/login")
  }

  const handleHomeClick = () => {
    if (onClickHome) {
      onClickHome()
    } else if (homeOverride) {
      navigate(homeOverride)
    } else if (isAfterSurveyPage && user) {
      navigate("/aftersurvey")
    } else {
      navigate("/")
    }
  }

  return (
    <nav
      className={`
        sticky top-0 z-40 flex items-center justify-between px-8 py-4
        bg-blue-700 transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        ${scrolled ? "shadow-lg" : "shadow"}
      `}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex-1 flex items-center">
        {!hideLogo && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 mr-4 focus:outline-none"
            title="GoVoice Home"
          >
            <img
              src={GoVoiceLogo || "/placeholder.svg"}
              alt="GoVoice Valenzuela"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <span className="text-white font-bold text-lg sm:text-xl tracking-wide">GoVoice</span>
          </button>
        )}

        <button
          type="button"
          className={`
            bg-white text-blue-700 font-semibold rounded
            p-2 md:px-6 md:py-2
            text-sm md:text-base
            flex items-center gap-2
            shadow-none border-none hover:bg-blue-100
            truncate max-w-[3rem] sm:max-w-[6rem] md:max-w-[10rem]
            transition-all duration-300
            min-w-[2.75rem] min-h-[2.75rem] md:min-w-[3.25rem] md:min-h-[3.25rem]
            ${isSurveyHomePage ? "invisible" : ""}
          `}
          style={{ minWidth: 0 }}
          onClick={handleHomeClick}
          disabled={isSurveyHomePage}
          title="Home"
        >
          <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl">
            <HiHome className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <span className="hidden md:inline">Home</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="flex items-center gap-1 cursor-pointer select-none">
            <span
              className="text-white font-semibold text-base sm:text-lg max-w-[5.5rem] sm:max-w-xs truncate block"
              title={user?.name || user?.email || "Guest"}
            >
              {user?.name || user?.email || "Guest"}
            </span>

            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.name || "avatar"}
                className="w-7 h-7 rounded-full border"
              />
            ) : (
              <span className="rounded-full p-1 flex items-center justify-center">
                <HiOutlineUserCircle className="text-white text-2xl" />
              </span>
            )}

            <HiChevronUp
              className={`text-white text-xl transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-50">
              {!user ? (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={onClickLogin ? onClickLogin : () => navigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={onClickRegister ? onClickRegister : () => navigate("/register")}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <HiCog className="text-white text-2xl cursor-pointer" title="Settings" onClick={() => setShowSettings(true)} />

        <UserSettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
