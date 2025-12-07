import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiCog,
  HiOutlineUserCircle,
  HiChevronUp,
  HiHome,
} from "react-icons/hi";
import UserSettingsModal from "./UserSettingsModal";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onClickHome, onClickLogin, onClickRegister }) => {
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownTimeout = useRef();

  const navigate = useNavigate();
  const location = useLocation();

  const isSurveyHomePage = location.pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

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
          onClick={onClickHome ? onClickHome : () => navigate("/")}
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
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-1 cursor-pointer select-none">
            <span
              className="text-white font-semibold text-base sm:text-lg max-w-[5.5rem] sm:max-w-xs truncate block"
              title={user?.name || user?.email || "Guest"}
            >
              {user?.name || user?.email || "Guest"}
            </span>

            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "avatar"}
                className="w-7 h-7 rounded-full border"
              />
            ) : (
              <span className="rounded-full p-1 flex items-center justify-center">
                <HiOutlineUserCircle className="text-white text-2xl" />
              </span>
            )}

            <HiChevronUp
              className={`text-white text-xl transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-50">
              {!user ? (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={
                      onClickLogin ? onClickLogin : () => navigate("/login")
                    }
                  >
                    Login
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={
                      onClickRegister
                        ? onClickRegister
                        : () => navigate("/register")
                    }
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <HiCog
          className="text-white text-2xl cursor-pointer"
          title="Settings"
          onClick={() => setShowSettings(true)}
        />

        <UserSettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </nav>
  );
};

export default Navbar;
