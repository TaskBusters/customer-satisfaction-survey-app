import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyModal({ open, onAccept }) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleDecline = () => {
    navigate("/"); // redirects to home
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h2>
        <div className="border-2 rounded-lg w-full px-4 py-3 mb-5 h-36 overflow-y-scroll">
          <p className="text-[17px] font-semibold text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className="flex gap-8 mt-2">
          <button
            className="border-2 rounded-lg px-8 py-2 text-xl font-semibold hover:bg-gray-200"
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="border-2 rounded-lg px-8 py-2 text-xl font-semibold hover:bg-gray-200"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
