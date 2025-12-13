import { useTranslation } from "react-i18next"

export default function RadioField({
  label,
  options,
  value,
  onChange,
  required = false,
  showRequired = false,
  name,
  otherValue,
  onOtherChange,
  disabled = false,
  error = null,
  otherError = null,
}) {
  const { t } = useTranslation()

  const hasError = !!error

  return (
    <div className="mb-6 w-full">
      {label && (
        <label className="block text-base font-bold mb-3 text-gray-800">
          {label}
          {showRequired && <span className="text-red-600 ml-1">*</span>}
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
              name={name}
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onChange={() => {
                onChange(opt.value)
              }}
              disabled={disabled}
            />
            <span className="text-base text-gray-700">{opt.label}</span>
            {opt.value === "others" && value === "others" && (
              <input
                type="text"
                className={`ml-2 border rounded px-2 py-1 w-[160px] focus:ring focus:ring-blue-200 ${
                  otherError ? "border-red-600" : ""
                }`}
                placeholder={t("survey.pleaseSpecify")}
                value={otherValue}
                onChange={(e) => onOtherChange(e.target.value)}
                maxLength={100}
                disabled={disabled}
              />
            )}
          </label>
        ))}
      </div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      {otherError && <span className="text-xs text-red-500 mt-1 block">{otherError}</span>}
    </div>
  )
}
