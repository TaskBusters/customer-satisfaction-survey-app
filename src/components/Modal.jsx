// Modal.js
import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-[350px] sm:w-[420px] p-6 text-center flex flex-col gap-3">
        {title && <div className="text-xl font-bold mb-2">{title}</div>}
        <div>{children}</div>
        <button
          className="mt-4 bg-blue-700 text-white font-bold py-2 px-4 rounded hover:bg-blue-800"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
