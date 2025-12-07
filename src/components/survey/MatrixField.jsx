"use client";

import { useState } from "react";
import { isFieldRequired } from "../../survey/surveyUtils";

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
  const [touched, setTouched] = useState(false);

  const effectiveRequired = field.conditionalRequired
    ? isFieldRequired(field, answers)
    : required;

  const missingRows = effectiveRequired
    ? rows.filter(
        (row) =>
          !value[row.name] && value[row.name] !== 0 && value[row.name] !== "NA"
      )
    : [];

  const hasError = effectiveRequired && touched && missingRows.length > 0;

  const handleAnswer = (rowName, colValue) => {
    setTouched(true);
    onChange({ ...value, [rowName]: colValue });
  };

  return (
    <div className="mb-12 px-2 w-full">
      {label && (
        <div className="font-bold mb-4 text-lg text-gray-800">{label}</div>
      )}

      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="bg-white shadow rounded-xl mb-8 p-4 sm:p-6 lg:p-8 w-full max-w-full"
        >
          <div className="font-bold text-lg sm:text-xl mb-3">{row.label}</div>

          <div
            className={`
              grid w-full gap-4 sm:gap-6 
              grid-cols-3 
              md:grid-cols-4 
              lg:grid-cols-5 
            `}
          >
            {columns.map((col, colIdx) => {
              const isSelected = String(value[row.name]) === String(col.value);

              return (
                <div
                  key={colIdx}
                  className={`
                    flex flex-col justify-start items-center 
                    rounded-xl px-2 py-3 cursor-pointer select-none
                    transition-all duration-150 ease-out
                    outline-none h-auto // 🛑 H-AUTO: Allow height to adjust based on wrapped text
                    min-h-[180px] // 🛑 MIN-H: Set a reasonable minimum height
                    ${
                      isSelected
                        ? "scale-105 shadow-md bg-blue-200 ring-2 ring-blue-500"
                        : "hover:scale-105 hover:shadow-lg"
                    }
                  `}
                  // 🛑 REMOVED fixed height style={{ height: "200px" }}
                  onClick={() => handleAnswer(row.name, col.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAnswer(row.name, col.value);
                    }
                  }}
                >
                  {col.emoji && (
                    <span className="text-5xl mb-1 h-16 flex items-center justify-center">
                      {col.emoji}
                    </span>
                  )}

                  {/* LABEL - Must be flexible */}
                  <span
                    className="
                      text-xs sm:text-sm md:text-base text-center font-medium
                      break-words whitespace-normal leading-tight
                      transition-all duration-200 flex-grow // 🛑 FLEX-GROW: Pushes the radio button down
                      cursor-pointer mt-2 mb-3 // 🛑 MARGINS: Add vertical margin for spacing
                      hover:text-blue-600
                      active:text-blue-800
                    "
                  >
                    {col.label}
                  </span>

                  <input
                    type="radio"
                    name={row.name}
                    value={col.value}
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-0 w-0 opacity-0 pointer-events-none"
                  />

                  {/* 🛑 RADIO BUTTON CONTAINER - Must be isolated and consistently centered */}
                  <div
                    className={`
                      h-7 w-7 rounded-full border-2 
                      flex items-center justify-center flex-shrink-0 // 🛑 FLEX-SHRINK-0: Prevents squeezing
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400 bg-white"
                      }
                    `}
                  ></div>
                </div>
              );
            })}
          </div>

          {hasError && !value[row.name] && (
            <span className="text-xs text-red-500 mt-2 block">
              Please select an option.
            </span>
          )}
        </div>
      ))}

      {hasError && (
        <div className="text-red-600 mt-2 text-sm font-semibold">
          Please answer all required questions above.
        </div>
      )}
    </div>
  );
}
