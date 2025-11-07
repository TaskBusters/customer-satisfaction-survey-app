// Submissions.jsx
import React, { useEffect, useState } from "react";

export default function Submissions({ submissionsProp }) {
  const [submissions, setSubmissions] = useState(submissionsProp || []);

  useEffect(() => {
    if (!submissionsProp) {
      fetch("/api/submissions")
        .then((res) => res.json())
        .then(setSubmissions)
        .catch(() => setSubmissions([]));
    }
  }, [submissionsProp]);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#eaeaea]">
      <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow">
        <div className="border-2 border-black rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Submissions:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-base font-semibold border-b border-gray-300">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-base font-semibold border-b border-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-400 py-6">
                      No submissions
                    </td>
                  </tr>
                ) : (
                  submissions.map((s, i) => (
                    <tr
                      key={i}
                      className={`bg-[#faf7f4] border-b border-gray-200 ${
                        i % 2 === 1 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.date}
                      </td>
                      <td className="px-4 py-3">{s.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
