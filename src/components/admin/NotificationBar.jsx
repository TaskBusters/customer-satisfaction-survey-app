import React from "react";

export default function NotificationBar({ message, onClear }) {
  if (!message) return null;
  return (
    <div className="bg-blue-100 border border-blue-300 rounded mb-4 p-3 flex justify-between items-center">
      <span>{message}</span>
      <button
        className="ml-4 px-2 py-1 rounded bg-white hover:bg-blue-200 text-blue-700 text-sm"
        onClick={onClear}
      >
        Dismiss
      </button>
    </div>
  );
}
