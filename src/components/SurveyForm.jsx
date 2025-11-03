import React, { useState } from "react";

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

// --- Generic Survey Renderer ---

// --- Field definitions ---
const fields = [
  // --- Personal Info ---
  {
    type: "radio",
    name: "clientType",
    label: "Client type",
    options: [
      { value: "citizen", label: "Citizen" },
      { value: "business", label: "Business" },
      { value: "government", label: "Government (Employee or another agency)" },
    ],
  },
  {
    type: "radio",
    name: "gender",
    label: "Gender",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
  },
  {
    type: "text",
    name: "age",
    label: "Age",
    placeholder: "Enter age",
  },
  {
    type: "select",
    name: "region",
    label: "Region of Residence",
    options: [
      { value: "NCR", label: "National Capital Region (NCR)" },
      { value: "CAR", label: "Cordillera Administrative Region (CAR)" },
      // ... add other regions as needed
    ],
  },
  {
    type: "text",
    name: "service",
    label: "Service Availed",
    placeholder: "Enter service",
  },

  // --- CC Awareness ---
  {
    type: "radio",
    name: "ccAwareness",
    label:
      "Which of the following best describes your awareness of a Citizen's Charter (CC)?",
    options: [
      { value: 1, label: "I know what a CC is and I saw this office’s CC." },
      {
        value: 2,
        label: "I know what a CC is but I did NOT see this office’s CC.",
      },
      {
        value: 3,
        label: "I learned of the CC only when I saw this office’s CC.",
      },
      {
        value: 4,
        label:
          "I do not know what a CC is and I did not see one in this office.",
      },
    ],
  },
  {
    type: "radio",
    name: "ccVisibility",
    label: "If aware of CC, would you say the CC of this office was...?",
    options: [
      { value: 1, label: "Easy to see" },
      { value: 2, label: "Somewhat easy to see" },
      { value: 3, label: "Difficult to see" },
      { value: 4, label: "Not visible at all" },
      { value: 5, label: "Not Applicable" },
    ],
    conditional: { showIf: { ccAwareness: [1, 2, 3] } },
  },
  {
    type: "radio",
    name: "ccHelpfulness",
    label: "If aware of CC, how much did the CC help you in your transaction?",
    options: [
      { value: 1, label: "Helped very much" },
      { value: 2, label: "Somewhat helped" },
      { value: 3, label: "Did not help" },
      { value: 4, label: "Not Applicable" },
    ],
    conditional: { showIf: { ccAwareness: [1, 2, 3] } },
  },

  // --- SQD Matrix (Satisfaction and Transaction Ratings with scale) ---
  {
    type: "matrix",
    name: "sqdRatings",
    label:
      "For SQD 0-8, please put a check mark (✓) on the column that best corresponds to your answer.",
    rows: [
      {
        name: "SQD0",
        label: "I am satisfied with the service that I availed.",
      },
      {
        name: "SQD1",
        label: "I spent a reasonable amount of time for my transaction.",
      },
      {
        name: "SQD2",
        label:
          "The office followed the transaction's requirements and steps based on the information provided.",
      },
      {
        name: "SQD3",
        label:
          "The steps (including payment) I needed to do for my transaction were easy and simple.",
      },
      {
        name: "SQD4",
        label:
          "I easily found information about my transaction from the office or its website.",
      },
      {
        name: "SQD5",
        label:
          "I paid a reasonable amount of fees for my transaction. (If service was free, mark the 'N/A' column)",
      },
      {
        name: "SQD6",
        label:
          "I feel the office was fair to everyone or 'walang palakasan' during my transaction.",
      },
      {
        name: "SQD7",
        label:
          "I was treated courteously by the staff, and (if asked for help) the staff was helpful.",
      },
      {
        name: "SQD8",
        label:
          "I got what I needed from the government office, or (if denied) denial of request was sufficiently explained to me.",
      },
    ],
    columns: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neither Agree nor Disagree" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" },
      { value: "NA", label: "Not Applicable" },
    ],
  },

  // --- Suggestions ---
  {
    type: "textarea",
    name: "suggestions",
    label: "Suggestions on how we can further improve our services (optional):",
    placeholder: "Enter suggestions",
  },
  {
    type: "text",
    name: "email",
    label: "Email address (optional):",
    placeholder: "Enter email",
  },
];

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
