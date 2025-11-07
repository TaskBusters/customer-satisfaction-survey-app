  import React, { useEffect, useRef } from "react";
  import { HiX, HiUser, HiGlobe, HiQuestionMarkCircle } from "react-icons/hi";

  // Modal item list
  const settingsItems = [
    { label: "Account", icon: <HiUser className="text-xl mr-3" /> },
    { label: "Language Options", icon: <HiGlobe className="text-xl mr-3" /> },
    { label: "About", icon: <HiQuestionMarkCircle className="text-xl mr-3" /> },
  ];

  export default function UserSettingsModal({ open, onClose }) {
    const cardRef = useRef();

    // Prevent background scroll when modal is open
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

    // Click outside card closes modal
    function handleBackdropClick(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[80px]">
        <div
          ref={cardRef}
          className="w-full max-w-lg mx-2 md:mx-0 bg-white rounded-2xl shadow-2xl border relative
            animate-fadeIn flex flex-col"
          style={{
            minHeight: "auto",
          }}
        >
          {/* Close + Title */}
          <div className="flex items-center px-4 pt-4 pb-2 border-b">
            <button
              onClick={onClose}
              className="mr-2 text-gray-700 hover:text-blue-700 focus:outline-none transition-colors"
              aria-label="Close"
            >
              <HiX className="text-2xl" />
            </button>
            <span className="font-semibold text-lg mx-auto">Settings</span>
          </div>
          {/* List */}
          <ul className="flex flex-col gap-1 mt-2 pb-2">
            {settingsItems.map((item) => (
              <li key={item.label}>
                <button className="w-full flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100 text-left font-normal border-b last:border-b-0 transition-colors">
                  {item.icon}
                  <span className="flex-grow">{item.label}</span>
                  <span className="ml-auto text-gray-400 text-xl">&gt;</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
