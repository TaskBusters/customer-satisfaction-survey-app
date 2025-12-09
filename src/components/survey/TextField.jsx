import { useState } from "react";
import { isAgeValid } from "../../survey/surveyUtils";

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  name,
  required = false,
}) {
  const [touched, setTouched] = useState(false);
  const hasError = required && touched && !value;

  // Add age-specific out-of-range check
  const isAgeField = name === "age";
  const outOfRangeError = isAgeField && touched && value && !isAgeValid(value);

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
        required={required}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 placeholder-opacity-100 ${
          hasError || outOfRangeError ? "border-red-500" : ""
        }`}
        value={value || ""}
        onBlur={() => setTouched(true)}
        onChange={(e) => {
          setTouched(true);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          This field is required.
        </span>
      )}
      {outOfRangeError && (
        <span className="text-xs text-red-500 mt-1 block">
          Please enter a valid age.
        </span>
      )}
    </div>
  );
}
