import React, { useState, useRef, useEffect } from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { HiCog, HiOutlineUserCircle, HiChevronUp } from "react-icons/hi";
import UserSettingsModal from "./UserSettingsModal";

const Navbar = ({
  username = "Guest",
  onClickHome,
  onClickLogin,
  onClickRegister,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeout = useRef();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  // Animate on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dropdown handlers
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
        sticky top-0 z-40
        flex items-center justify-between px-8 py-4 bg-blue-700
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        ${scrolled ? "shadow-lg" : "shadow"}
      `}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex-1 flex items-center">
        <button
          type="button"
          className="bg-white text-blue-700 font-semibold rounded px-6 py-2 shadow-none border-none hover:bg-blue-100 focus:ring-0"
          onClick={onClickHome ? onClickHome : () => navigate("/")}
        >
          Home
        </button>
      </div>
      <div className="flex items-center gap-4">
        {/* Account hover dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-1 cursor-pointer select-none">
            <span className="text-white font-semibold text-lg">{username}</span>
            <span className="rounded-full p-1 flex items-center justify-center">
              <HiOutlineUserCircle className="text-white text-2xl" />
            </span>
            <HiChevronUp
              className={`text-white text-xl transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-50">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-blue-100 font-medium text-blue-700"
                onClick={onClickLogin ? onClickLogin : () => navigate("/login")}
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
            </div>
          )}
        </div>
        {/* Settings gear */}
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
