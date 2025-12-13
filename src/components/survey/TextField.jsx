"use client"

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
  const hasError = !!error

  const isAgeField = name === "age"
  const isServiceField = name === "service"
  const isNumericField = isAgeField
  const isAlphabeticField = isServiceField
  const isEmailField = name === "email"

  const allowedProviders = [
    "@yahoo.com.ph",
    "@ymail.com",
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com",
    "@live.com",
    "@icloud.com",
    "@protonmail.com",
    "@aol.com",
    "@mail.com",
    "@zoho.com",
    "@yandex.com",
    "@gmx.com",
    "@tutanota.com",
    "@fastmail.com",
  ]

  const allowedDomains = [".com", ".net", ".org", ".gov", ".gov.ph", ".mil", ".int"]

  const validateEmail = (email) => {
    if (!email) return { valid: true, message: "" }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Invalid email format" }
    }

    const hasValidProvider = allowedProviders.some((provider) => email.toLowerCase().endsWith(provider))
    if (hasValidProvider) {
      return { valid: true, message: "" }
    }

    const hasValidDomain = allowedDomains.some((domain) => email.toLowerCase().includes(domain))
    if (!hasValidDomain) {
      return { valid: false, message: "Email domain not allowed" }
    }

    return { valid: true, message: "" }
  }

  const emailValidation = isEmailField ? validateEmail(value) : { valid: true, message: "" }

  const handleChange = (e) => {
    let inputValue = e.target.value
    if (isNumericField) {
      inputValue = inputValue.replace(/[^0-9]/g, "")
    }
    if (isAlphabeticField) {
      inputValue = inputValue.replace(/[^a-zA-Z\s]/g, "")
    }
    onChange(inputValue)
  }

  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={name} className="block mb-2 text-sm font-semibold text-black">
          {label}
          {showRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        id={name}
        name={name}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 placeholder-opacity-100 ${
          hasError ? "border-red-500" : ""
        }`}
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={maxLength}
        disabled={disabled}
      />
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      {isEmailField && !emailValidation.valid && (
        <span className="text-xs text-red-500 mt-1 block">{emailValidation.message}</span>
      )}
    </div>
  )
}
