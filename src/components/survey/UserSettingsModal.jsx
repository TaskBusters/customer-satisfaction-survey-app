import React, { useEffect, useRef } from "react";
import {
  HiX,
  HiUser,
  HiGlobe,
  HiBell,
  HiInformationCircle,
} from "react-icons/hi";

const settingsItems = [
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
    label: "Notifications",
    icon: <HiBell className="text-xl mr-3 text-blue-600" />,
    value: "notifications",
  },
  {
    label: "About",
    icon: <HiInformationCircle className="text-xl mr-3 text-blue-600" />,
    value: "about",
  },
];

export default function UserSettingsModal({ open, onClose, onSelect }) {
  const cardRef = useRef();

  // Prevent background scroll
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

  // Click outside to close
  function handleBackdropClick(e) {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-24 md:pt-32">
    {/* Dark overlay BEHIND the modal */}
    <div
      onMouseDown={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    />

    {/* Modal card ABOVE overlay */}
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
        <ul className="flex flex-col gap-1 my-4 px-3">
          {settingsItems.map((item) => (
            <li key={item.value}>
              <button
                className={`
                  w-full flex items-center px-4 py-4 rounded-lg 
                  font-medium text-blue-800 bg-blue-50
                  hover:bg-blue-100 hover:shadow
                  transition-colors border-b border-blue-100 last:border-b-0
                  focus:outline-none
                `}
                onClick={() => {
                  if (onSelect) onSelect(item.value);
                  onClose();
                }}
              >
                {item.icon}
                <span className="flex-grow text-left">{item.label}</span>
                <span className="ml-auto text-blue-400 text-xl">&gt;</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Simple CSS animation keyframes */}
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
  );
}
