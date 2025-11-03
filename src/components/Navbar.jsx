import React, { useState, useRef } from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { HiCog, HiOutlineUserCircle, HiChevronUp } from "react-icons/hi";

const Navbar = ({
  username = "Guest",
  onClickHome, // These can be custom handlers if you want, or omit for just routing
  onClickSettings,
  onClickLogin,
  onClickRegister,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef();
  const navigate = useNavigate();

  // Open on mouse enter, close with delay on mouse leave
  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-blue-700">
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
          onClick={onClickSettings}
        />
      </div>
    </nav>
  );
};

export default Navbar;
