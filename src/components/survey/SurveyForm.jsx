import React, { useState } from "react";
import fields from "../../survey/surveyFields";

// --- Standalone Field Components ---
function RadioField({ label, options, value, onChange }) {
  return (
    <div className="mb-6">
      {label && <div className="font-bold mb-2">{label}</div>}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <label className="flex items-center" key={i}>
            <input
              type="radio"
              className="mr-2"
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      {label && <div className="font-bold mb-2">{label}</div>}
      <input
        type="text"
        className="border px-3 py-2 rounded w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      {label && <div className="font-bold mb-2">{label}</div>}
      <textarea
        className="border px-3 py-2 rounded w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="mb-6">
      {label && <div className="font-bold mb-2">{label}</div>}
      <select
        className="border px-3 py-2 rounded w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MatrixField({ label, rows, columns, value = {}, onChange }) {
  return (
    <div className="mb-8 overflow-x-auto">
      {label && <div className="font-bold mb-2">{label}</div>}
      <table className="min-w-full text-sm border border-gray-300 rounded">
        <thead>
          <tr>
            <th className="border px-2 py-1 w-2/5"></th>
            {columns.map((col, ci) => (
              <th className="border px-2 py-1 text-center" key={ci}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td className="border px-2 py-1">{row.label}</td>
              {columns.map((col, ci) => (
                <td key={ci} className="border text-center">
                  <input
                    type="radio"
                    name={row.name}
                    value={col.value}
                    checked={String(value[row.name]) === String(col.value)}
                    onChange={() =>
                      onChange({ ...value, [row.name]: col.value })
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Page Component ---
export default function SurveyFormPage({ onNext }) {
  const [answers, setAnswers] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(JSON.stringify(answers, null, 2));
    // if (onNext) onNext(answers);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-8 shadow rounded-xl bg-white"
      >
        <h2 className="text-3xl text-blue-700 font-bold text-center mb-8">
          Client Satisfaction Survey
        </h2>
        <SurveyRenderer
          fields={fields}
          answers={answers}
          setAnswers={setAnswers}
        />
        <button
          type="submit"
          className="bg-blue-700 text-white rounded px-6 py-3 mt-6 mx-auto block"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
