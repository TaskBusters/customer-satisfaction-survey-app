import React, { useState } from "react";
import { isFieldRequired } from "../survey/surveyUtils";

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

  // Support conditional required
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-6 items-end w-full">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col items-center w-full">
                <span
                  className={`mb-1 ${col.emojiColor || ""} ${
                    col.value === "NA"
                      ? "border-4 border-black rounded-full px-3 inline-flex items-center justify-center"
                      : ""
                  }`}
                  style={{
                    fontSize: col.value === "NA" ? "2.25rem" : "2rem",
                    ...(col.value === "NA"
                      ? {
                          minWidth: "3.5rem",
                          height: "3.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }
                      : {}),
                  }}
                >
                  {col.emoji || getDefaultEmoji(col.value)}
                </span>
                <span className="text-xs sm:text-sm md:text-base text-center mt-2 font-medium max-w-[6rem] break-words">
                  {col.label}
                </span>
                <input
                  type="radio"
                  name={row.name}
                  value={col.value}
                  checked={String(value[row.name]) === String(col.value)}
                  onChange={() => {
                    setTouched(true);
                    onChange({ ...value, [row.name]: col.value });
                  }}
                  className={
                    "mt-4 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 accent-blue-600 border-2 border-gray-400" +
                    (col.value === "NA"
                      ? " border-3 sm:h-10 sm:w-10 md:h-12 md:w-12 accent-black"
                      : "")
                  }
                  style={
                    col.value === "NA" ? { borderWidth: "3px" } : undefined
                  }
                />
              </div>
            ))}
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

function getDefaultEmoji(value) {
  switch (String(value)) {
    case "1":
      return "😡";
    case "2":
      return "😞";
    case "3":
      return "😐";
    case "4":
      return "😊";
    case "5":
      return "😁";
    case "NA":
      return "N/A";
    default:
      return "";
  }
}
