"use client";

import { useState, useRef, useCallback } from "react";
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

  const scrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const onMouseDown = useCallback((e) => {
    isDraggingRef.current = true;
    if (scrollRef.current) {
      startXRef.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeftRef.current = scrollRef.current.scrollLeft;
      scrollRef.current.style.cursor = "grabbing";
    }
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  }, []);

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
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            className="flex flex-row gap-8 w-full overflow-x-auto py-2 px-8"
            style={{ cursor: "grab" }}
          >
            {columns.map((col, colIdx) => {
              const isSelected = String(value[row.name]) === String(col.value);

              return (
                <div
                  key={colIdx}
                  className={`
    flex flex-col justify-between items-center 
    rounded-xl px-2 py-3 cursor-pointer select-none
    transition-all duration-150 ease-out
    outline-none
    ${
      isSelected
        ? "scale-105 shadow-md bg-blue-200"
        : "hover:scale-105 hover:shadow"
    }
  `}
                  style={{
                    height: "200px",
                    minWidth: "140px", // <-- INCREASED MINIMUM WIDTH
                    maxWidth: "150px",
                    ...(colIdx === 0 && { marginLeft: "8px" }),
                  }}
                  onClick={(e) => {
                    if (
                      Math.abs(
                        scrollLeftRef.current - scrollRef.current.scrollLeft
                      ) > 5
                    ) {
                      e.preventDefault();
                      return;
                    }
                    handleAnswer(row.name, col.value);
                  }}
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

                  {/* LABEL with blue hover */}
                  <span
                    className="
                      text-xs sm:text-sm md:text-base text-center font-medium
                      break-words whitespace-normal leading-tight
                      transition-all duration-200
                      cursor-pointer
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

                  <div
                    className={`
                      h-7 w-7 rounded-full border-2 
                      flex items-center justify-center
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
