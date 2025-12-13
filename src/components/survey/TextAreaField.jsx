import { useState } from "react"

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  name,
  rows = 4,
  required = false,
  showRequired = false,
  disabled = false,
  error = null,
  maxLength = 500,
}) {
  const [touched, setTouched] = useState(false)
  const charCount = (value || "").length

  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
          {label}
          {showRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        {...(required && { required: true })}
        disabled={disabled}
        className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 
        focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 placeholder-opacity-100 dark:bg-gray-50 dark:focus:ring-blue-500 dark:focus:border-blue-500
        ${error ? "border-red-500" : ""}`}
        value={value || ""}
        onChange={(e) => {
          setTouched(true)
          onChange(e.target.value)
        }}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={maxLength}
      />
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {charCount}/{maxLength} characters
        </span>
      </div>
    </div>
  )
}
