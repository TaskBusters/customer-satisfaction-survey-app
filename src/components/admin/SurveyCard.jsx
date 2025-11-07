import React from "react";

export default function SurveyCard({ survey }) {
  return (
    <div className="bg-white rounded-xl border px-6 py-5 shadow mb-2">
      <div className="font-bold text-base mb-1">
        Survey Title: {survey.title}
      </div>
      <div className="border-b mb-2"></div>
      <div className="text-sm mb-1">
        Status: <span className="font-semibold">{survey.status}</span>
      </div>
      <div className="text-sm mb-1">
        Number of Responses:{" "}
        <span className="font-semibold">{survey.responses}</span>
      </div>
      <div className="text-sm mb-1">
        Creator: <span className="font-semibold">{survey.creator}</span>
      </div>
      <div className="text-xs text-gray-500 mt-3 mb-3">
        Last Modified: {survey.lastModified}
      </div>
      {survey.canEdit && (
        <button className="text-blue-700 underline font-semibold py-1 px-3 rounded text-sm hover:text-blue-900">
          Edit
        </button>
      )}
    </div>
  );
}
