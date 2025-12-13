import React from "react";

export default function SurveyList({ surveys, onEdit, onDelete }) {
  return (
    <section className="flex flex-col gap-6">
      {surveys.map((survey) => (
        <div
          key={survey.title}
          className="border rounded-lg p-5 bg-white shadow-sm flex flex-col"
        >
          <div className="font-semibold text-lg">{survey.title}</div>
          <div className="text-sm mt-1">
            Status: <span className="font-medium">{survey.status}</span>
            <span className="ml-4">
              Number of Responses:{" "}
              <span className="font-bold">{survey.responses}</span>
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Creator: {survey.creator}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Last Modified: {survey.lastModified}
          </div>
          <div className="mt-3 flex gap-3">
            {survey.canEdit && (
              <>
                <button
                  className="text-sm px-4 py-1.5 border font-semibold rounded hover:bg-gray-100 transition"
                  onClick={() => onEdit(survey)}
                >
                  Edit
                </button>
                <button
                  className="text-sm px-4 py-1.5 border font-semibold rounded text-red-600 hover:bg-red-50 transition"
                  onClick={() => onDelete(survey)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
