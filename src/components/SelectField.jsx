import React, { useState } from "react";

export default function SelectField({ label, options, value, onChange, name }) {
  const [touched, setTouched] = useState(false);
  const hasError = touched && (!value || value === "");

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
        required
        className={`bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
          hasError ? "border-red-500" : ""
        }`}
        value={value || ""}
        onBlur={() => setTouched(true)}
        onChange={(e) => {
          setTouched(true);
          onChange(e.target.value);
        }}
      >
        <option value="" disabled hidden>
          Select...
        </option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Please select an option.
        </span>
      )}
    </div>
  );
}
