import React from "react";

export default function RadioField({ label, options, value, onChange }) {
  return (
    <div className="mb-6 w-full">
      {label && (
        <label className="block text-base font-bold mb-3 text-gray-800">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-3 w-full">
        {options.map((opt, i) => (
          <label
            key={i}
            className="inline-flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            <input
              type="radio"
              className="form-radio text-blue-700 w-4 h-4 border-2 border-gray-300 transition-all focus:ring-2 focus:ring-blue-500"
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onChange={() => onChange(opt.value)}
            />
            <span className="text-base text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
