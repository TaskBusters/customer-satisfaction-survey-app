import React from "react";

export default function StatCard({ label, value, color = "bg-gray-200" }) {
  return (
    <div
      className={`rounded-xl flex-1 min-w-[150px] p-5 flex flex-col items-start shadow ${color}`}
    >
      <span className="text-gray-100 font-semibold text-sm uppercase mb-1">
        {label}
      </span>
      <span className="text-2xl md:text-3xl font-extrabold text-white">
        {value}
      </span>
    </div>
  );
}
