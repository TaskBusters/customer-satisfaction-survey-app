import React from "react";

export default function SurveyResponseCard({ response, onView }) {
  const sampleRespondents = response.respondentsDetails ?? [];

  // Only fields from your surveyform section details
  const mainFields = [
    { label: "Client Type", key: "Client Type" },
    { label: "Gender", key: "Gender" },
    { label: "Age", key: "Age" },
    { label: "Region", key: "Region of Residence" },
    { label: "Service Availed", key: "Service Availed" },
    { label: "CC Awareness", key: "ccAwareness" },
    { label: "CC Visibility", key: "ccVisibility" },
    { label: "CC Helpfulness", key: "ccHelpfulness" },
    { label: "Suggestions", key: "Suggestions" },
    { label: "Email", key: "Email" },
  ];

  const renderRatings = (rating) =>
    rating ? (
      <div className="mb-1">
        <b>SQD Ratings:</b>
        <ul className="list-disc ml-5">
          {Object.entries(rating).map(([sq, val]) => (
            <li key={sq}>
              {sq}: {val}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div
      className="border rounded-lg p-5 bg-white shadow-sm flex flex-col hover:shadow transition group overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 190px)" }} // Makes card use most of the vertical viewport
    >
      <div className="font-semibold text-lg mb-1 group-hover:text-blue-600">
        {response.title}
      </div>
      <div className="text-sm mb-4">
        <div>
          <span className="font-medium text-gray-700">Office: </span>
          <span className="font-semibold">{response.office}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Date: </span>
          <span className="font-semibold">{response.date}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Client Type: </span>
          <span className="font-semibold">{response.clientType}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Respondents: </span>
          <span className="font-bold">{response.respondents}</span>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {sampleRespondents.map((resp, idx) =>
          resp.responses ? (
            <div
              key={idx}
              className="bg-gray-50 border rounded p-4 text-xs mb-2"
            >
              <div className="font-bold text-blue-800 mb-2">
                Sample Answer {idx + 1}
              </div>
              <div className="mb-2">
                <b>Name:</b> {resp.fullName}
              </div>
              <div className="space-y-1 mb-2">
                {mainFields.map(
                  (field) =>
                    resp.responses[field.key] && (
                      <div key={field.key}>
                        <b>{field.label}:</b> {resp.responses[field.key]}
                      </div>
                    )
                )}
              </div>
              {renderRatings(resp.responses["Rating"])}
            </div>
          ) : null
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="text-sm px-4 py-1.5 border font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={onView}
        >
          View
        </button>
      </div>
    </div>
  );
}
