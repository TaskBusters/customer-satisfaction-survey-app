import React from "react";

export default function SelectField({ label, options, value, onChange, name }) {
  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className="bg-gray-50 border-gray-300 text-sm rounded-lg focus:ring-blue-500
             focus:border-blue-500 block w-full p-2.5 placeholder-gray-300 dark:focus:ring-blue-500 
             dark:focus:border-blue-500"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
