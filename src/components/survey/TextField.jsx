"use client";

import { useState } from "react";
import { isAgeValid } from "../../survey/surveyUtils";

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  name,
  required = false,
  showRequired = false,
  disabled = false,
  error = null,
  maxLength = 255,
}) {
  const [touched, setTouched] = useState(false);
  const hasError = (required && touched && !value) || !!error;

  // Add age-specific validation
  const isAgeField = name === "age";
  const isNumericField = isAgeField;

  // Letters-only validation for service field
  const isServiceField = name === "service";

  // For age field, enforce numeric input only
  // For service field, enforce letters only
  const handleChange = (e) => {
    let inputValue = e.target.value;
    if (isNumericField) {
      inputValue = inputValue.replace(/[^0-9]/g, "");
    } else if (isServiceField) {
      // Allow only letters (a-z, A-Z) and spaces
      inputValue = inputValue.replace(/[^a-zA-Z\s]/g, "");
    }
    setTouched(true);
    onChange(inputValue);
  };

  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-semibold text-black"
        >
          {label}
          {showRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        id={name}
        name={name}
        required={required}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 placeholder-opacity-100 ${
          hasError ? "border-red-500" : ""
        }`}
        value={value || ""}
        onBlur={() => setTouched(true)}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={maxLength}
        disabled={disabled}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 block">{error}</span>
      )}
      {!error && isAgeField && touched && value && !isAgeValid(value) && (
        <span className="text-xs text-red-500 mt-1 block">
          Please enter a valid age.
        </span>
      )}
      {isNumericField && maxLength && value && (
        <span className="text-xs text-gray-500 mt-1 block">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
