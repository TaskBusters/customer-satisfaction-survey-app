import React, { useEffect, useState } from "react";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
};

const MOCK_SUBMISSIONS = [
  { date: "2025-11-01", status: "Approved" },
  { date: "2025-11-03", status: "Completed" },
  { date: "2025-11-05", status: "Pending" },
  { date: "2025-11-06", status: "Rejected" },
  { date: "2025-11-08", status: "Completed" },
  { date: "2025-11-09", status: "Approved" },
  { date: "2025-11-10", status: "Pending" },
];

export default function Submissions({ submissionsProp }) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState(
    submissionsProp || MOCK_SUBMISSIONS
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.isAdmin || user.role === "admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);
  if (!user || user.isAdmin || user.role === "admin") return null;

  useEffect(() => {
    if (!submissionsProp) {
      setLoading(true);
      fetch("/api/submissions")
        .then((res) => res.json())
        .then((data) => {
          setSubmissions(data);
          setLoading(false);
        })
        .catch(() => {
          setSubmissions([]);
          setLoading(false);
        });
    }
  }, [submissionsProp]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-10 md:pt-20 pb-10">
      <div className="w-full max-w-4xl px-1 sm:px-4">
        {" "}
        {/* Wider panel */}
        {/* Back button */}
        <button
          className="flex items-center gap-2 mb-6 px-5 py-2 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 font-semibold shadow transition"
          onClick={() => navigate(-1)}
        >
          <HiArrowNarrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="rounded-2xl shadow-lg bg-white border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 pt-8 pb-1">
            <h2 className="font-bold text-2xl sm:text-3xl text-blue-800 mb-2 sm:mb-0 tracking-tight">
              My Submissions
            </h2>
            <span className="text-gray-500 text-base">
              {submissions.length > 0 ? `${submissions.length} found` : ""}
            </span>
          </div>
          <div className="px-5 sm:px-8 pt-2 pb-8">
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full table-auto border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700 rounded-l-xl">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700 rounded-r-xl">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-8 text-blue-700 font-semibold"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center text-gray-400 py-8 font-semibold"
                      >
                        No submissions yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s, i) => (
                      <tr
                        key={i}
                        className={"hover:bg-blue-50 rounded-xl transition"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 bg-[#faf7f4] rounded-l-xl">
                          {s.date}
                        </td>
                        <td className="px-4 py-3 bg-[#faf7f4] rounded-r-xl">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                            ${statusColors[s.status] || statusColors.default}`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
