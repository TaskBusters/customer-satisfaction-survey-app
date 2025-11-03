import React from "react";

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  name,
}) {
  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-semibold text-black"
        >
          {label}
        </label>
      )}
      <input
        type="text"
        id={name}
        name={name}
        className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
        focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
