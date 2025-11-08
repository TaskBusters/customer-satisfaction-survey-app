import React, { useEffect, useRef, useState } from "react";
import {
  HiX,
  HiUser,
  HiGlobe,
  HiInformationCircle,
  HiOutlineAdjustments,
  HiArrowLeft, // Added for the back button icon
} from "react-icons/hi";

const settingsItems = [
  {
    label: "About",
    icon: <HiInformationCircle className="text-xl mr-3 text-blue-600" />,
    value: "about",
  },
  {
    label: "Profile Settings",
    icon: <HiUser className="text-xl mr-3 text-blue-600" />,
    value: "profile",
  },
  {
    label: "Language Options",
    icon: <HiGlobe className="text-xl mr-3 text-blue-600" />,
    value: "language",
  },
  {
    label: "Text Size",
    icon: <HiOutlineAdjustments className="text-xl mr-3 text-blue-600" />,
    value: "textSize",
  },
];

export default function UserSettingsModal({ open, onClose }) {
  const cardRef = useRef();
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  function handleBackdropClick(e) {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-center items-start pt-24 md:pt-32"
        onMouseDown={handleBackdropClick}
      >
        {/* Dark overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>

        {/* Modal card */}
        <div
          ref={cardRef}
          className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-blue-600 animate-slideIn"
          style={{
            animation: "popupIn .35s cubic-bezier(0.53, 1.87, 0.58, 1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center px-4 py-4 border-b bg-blue-50 rounded-t-2xl">
            <span className="mx-auto text-lg font-bold text-blue-700 tracking-wide">
              Settings
            </span>
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-blue-700 hover:bg-blue-100 rounded-full p-2 focus:outline-none transition"
              aria-label="Close"
            >
              <HiX className="text-2xl" />
            </button>
          </div>
          {/* Setting Items */}
          {!activeSub && (
            <ul className="flex flex-col gap-1 my-4 px-3">
              {settingsItems.map((item) => (
                <li key={item.value}>
                  <button
                    className="
            w-full flex items-center px-4 py-4 rounded-lg 
            font-medium text-blue-800 bg-blue-50
            hover:bg-blue-100 hover:shadow
            transition-colors border-b border-blue-100 last:border-b-0
            focus:outline-none
          "
                    onClick={() => setActiveSub(item.value)}
                  >
                    {item.icon}
                    <span className="flex-grow text-left">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* SUB SETTINGS SCREEN (inside modal) */}
          {activeSub && (
            <div className="p-6 flex flex-col gap-4">
              <button
                onClick={() => setActiveSub(null)}
                className="flex items-center px-3 py-2 rounded-lg font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 hover:shadow transition-colors focus:outline-none w-fit"
              >
                <HiArrowLeft className="text-xl mr-2 text-blue-600" />
                <span>Back</span>
              </button>

              {activeSub === "about" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold mb-1">
                    About
                  </h2>
                  <p>
                    This application collects feedback as part of the Customer
                    Satisfaction Survey system.
                  </p>
                </>
              )}

              {activeSub === "profile" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold mb-1">
                    Profile Settings
                  </h2>
                  <p>
                    Profile settings will go here. (Edit name, email, avatar…)
                  </p>
                </>
              )}

              {activeSub === "language" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold mb-1">
                    Language Options
                  </h2>
                  <p>Language selection controls go here.</p>
                </>
              )}

              {activeSub === "textSize" && (
                <>
                  <h2 className="text-blue-700 text-lg font-bold mb-1">
                    Text Size
                  </h2>
                  <p>Font size/contrast/reading settings here.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* CSS animation keyframes */}
        <style>
          {`
          @keyframes popupIn {
            0% { transform: translateY(40px) scale(0.98); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-slideIn { animation: popupIn .35s cubic-bezier(0.53, 1.87, 0.58, 1); }
          `}
        </style>
      </div>
    </>
  );
}
