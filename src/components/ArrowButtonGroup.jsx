// ArrowButtonGroup.js
import React from "react";

export default function ArrowButtonGroup({
  onUp = () => window.scrollTo({ top: 0, behavior: "smooth" }),
  onDown = () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
}) {
  const buttons = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <polyline points="6 14 12 8 18 14" />
        </svg>
      ),
      onClick: onUp,
      key: "up",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <polyline points="6 10 12 16 18 10" />
        </svg>
      ),
      onClick: onDown,
      key: "down",
    },
  ];
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          type="button"
          onClick={btn.onClick}
          className="pointer-events-auto rounded-full bg-gray-300 opacity-60 hover:opacity-95 flex items-center justify-center w-9 h-9 shadow transition"
          style={{ border: "none", outline: "none" }}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
