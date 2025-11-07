import React from "react";

export default function SurveyResponseCard({ response, onView }) {
  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col hover:shadow transition group">
      <div className="font-semibold text-lg mb-1 group-hover:text-blue-600">
        {response.title}
      </div>
      <div className="text-sm mb-2">
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
      <div className="mt-3 flex gap-2">
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
