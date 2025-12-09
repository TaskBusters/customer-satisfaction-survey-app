import React from "react";

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  name,
  rows = 4,
}) {
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
      <textarea
        id={name}
        name={name}
        rows={rows}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 
        focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 placeholder-opacity-100 dark:bg-gray-50  dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
