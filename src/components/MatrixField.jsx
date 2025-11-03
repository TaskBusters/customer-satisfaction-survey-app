import React from "react";

export default function MatrixField({
  label,
  rows,
  columns,
  value = {},
  onChange,
}) {
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
          {/* Matrix grid—each column contains emoji, label, and input, vertically */}
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
                {/* Put radio directly under label for vertical alignment */}
                <input
                  type="radio"
                  name={row.name}
                  value={col.value}
                  checked={String(value[row.name]) === String(col.value)}
                  onChange={() => onChange({ ...value, [row.name]: col.value })}
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
        </div>
      ))}
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
