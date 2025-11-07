import React from "react";

export default function ResponseDetailsModal({ open, response, onClose }) {
  if (!open || !response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="font-bold text-xl mb-2">Response Details</div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Survey Title: </span>
            <span>{response.title}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Office: </span>
            <span>{response.office}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Date: </span>
            <span>{response.date}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Client Type: </span>
            <span>{response.clientType}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Respondents: </span>
            <span>{response.respondents}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
