"use client"

import { useState } from "react"
import { isFieldRequired } from "../../survey/surveyUtils"

export default function MatrixField({
  label,
  rows,
  columns,
  value = {},
  onChange,
  required = false,
  field = {},
  answers = {},
}) {
  const [touched, setTouched] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)

  // Support conditional required
  const effectiveRequired = field.conditionalRequired ? isFieldRequired(field, answers) : required

  const missingRows = effectiveRequired
    ? rows.filter((row) => !value[row.name] && value[row.name] !== 0 && value[row.name] !== "NA")
    : []

  const hasError = effectiveRequired && touched && missingRows.length > 0

  const handleAnswer = (rowName, colValue) => {
    setTouched(true)
    onChange({ ...value, [rowName]: colValue })
  }

  return (
    <div className="mb-12 px-2 w-full">
      {label && <div className="font-bold mb-4 text-lg text-gray-800">{label}</div>}

      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="bg-white shadow rounded-xl mb-8 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          <div className="font-bold text-lg sm:text-xl mb-3">{row.label}</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-6 items-end w-full">
            {columns.map((col, colIdx) => {
              const cellId = `${row.name}-${col.value}`
              const isSelected = String(value[row.name]) === String(col.value)
              const isHovered = hoveredCell === cellId

              return (
                <div
                  key={colIdx}
                  className="flex flex-col items-center justify-start w-full h-full"
                  onMouseEnter={() => setHoveredCell(cellId)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {col.emoji && (
                    <button
                      type="button"
                      onClick={() => handleAnswer(row.name, col.value)}
                      className={`text-3xl sm:text-4xl mb-1 h-10 sm:h-12 flex items-center justify-center
                        transition-all duration-200 transform cursor-pointer
                        ${isSelected ? "scale-125" : isHovered ? "scale-110" : "scale-100"}
                        ${isSelected ? "animate-pulse" : ""}
                        hover:drop-shadow-lg active:scale-95
                      `}
                      title={`Select ${col.label}`}
                    >
                      {col.emoji}
                    </button>
                  )}
                  <span
                    className="
                    text-xs sm:text-sm md:text-base
                    text-center mt-2 font-medium
                    max-w-[6.5rem] break-words leading-tight
                    transition-all duration-200
                    cursor-pointer
                    hover:text-blue-600
                    active:text-blue-800
                  "
                    onClick={() => handleAnswer(row.name, col.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleAnswer(row.name, col.value)
                      }
                    }}
                  >
                    {col.label}
                  </span>
                  <label
                    className={`mt-4 flex items-center justify-center cursor-pointer transition-all duration-200
                      ${isSelected ? "ring-2 ring-blue-400 rounded-full" : ""}
                      ${isHovered ? "scale-110" : "scale-100"}
                    `}
                    onClick={() => handleAnswer(row.name, col.value)}
                  >
                    <input
                      type="radio"
                      name={row.name}
                      value={col.value}
                      checked={isSelected}
                      onChange={() => handleAnswer(row.name, col.value)}
                      className={
                        "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 accent-blue-600 border-2 border-gray-400 transition-all" +
                        (col.value === "NA" ? " border-3 sm:h-10 sm:w-10 md:h-12 md:w-12 accent-black" : "")
                      }
                      style={col.value === "NA" ? { borderWidth: "3px" } : undefined}
                    />
                  </label>
                </div>
              )
            })}
          </div>
          {hasError && !value[row.name] && (
            <span className="text-xs text-red-500 mt-2 block animate-pulse">Please select an option.</span>
          )}
        </div>
      ))}
      {hasError && (
        <div className="text-red-600 mt-2 text-sm font-semibold animate-pulse">
          Please answer all required questions above.
        </div>
      )}
    </div>
  )
}
