import React, { useState } from "react";

export default function RadioField({
  label,
  options,
  value,
  onChange,
  required = false,
  name,
  otherValue, // <-- add these
  onOtherChange, // <--
}) {
  const [touched, setTouched] = useState(false);
  const hasError = required && touched && (value === undefined || value === "");

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
              className={`form-radio text-blue-700 w-4 h-4 border-2 border-gray-300 transition-all focus:ring-2 focus:ring-blue-500 ${
                hasError ? "border-red-600" : ""
              }`}
              required={required && i === 0}
              name={name}
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onBlur={() => setTouched(true)}
              onChange={() => {
                setTouched(true);
                onChange(opt.value);
              }}
            />
            <span className="text-base text-gray-700">{opt.label}</span>
            {/* Inline text input for "Others" */}
            {opt.value === "others" && value === "others" && (
              <input
                type="text" 
                className="ml-2 border rounded px-2 py-1 w-[160px] focus:ring focus:ring-blue-200"
                placeholder="Please specify"
                value={otherValue}
                onChange={(e) => onOtherChange(e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Please select an option.
        </span>
      )}
    </div>
  );
}
