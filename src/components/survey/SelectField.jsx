export default function SelectField({
  label,
  options,
  value,
  onChange,
  name,
  required = false,
  showRequired = false,
  disabled = false,
  error = null,
}) {
  const hasError = !!error

  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
          {label}
          {showRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        disabled={disabled}
        className={`bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
          hasError ? "border-red-500" : ""
        }`}
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value)
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
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  )
}
