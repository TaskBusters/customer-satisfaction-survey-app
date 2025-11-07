import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SearchBar from "../../components/admin/SearchBar";
import SurveyResponseCard from "../../components/admin/SurveyResponseCard";
import NotificationBar from "../../components/admin/NotificationBar";
import ResponseDetailsModal from "../../components/admin/ResponseDetailsModal";

const FAKE_RESPONSES = [
  {
    title: "Customer Satisfaction Survey",
    office: "Maysan Barangay Hall",
    date: "11/01/25",
    clientType: "Resident",
    respondents: 12,
  },
  {
    title: "Community Feedback Survey",
    office: "Maysan Barangay Hall",
    date: "11/01/25",
    clientType: "Business",
    respondents: 12,
  },
];

const filterOptions = ["Date", "Office", "Client Type"];

export default function AdminSurveyResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setResponses(FAKE_RESPONSES);
      setLoading(false);
    }, 350);
  }, []);

  // Basic filter (can extend with filter logic later)
  const filteredResponses = responses.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.office.toLowerCase().includes(search.toLowerCase()) ||
      r.clientType.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (response) => {
    setSelectedResponse(response);
    setDetailsOpen(true);
  };

  const handleClearMessage = () => setMessage("");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <NotificationBar message={message} onClear={handleClearMessage} />
        {/* Top controls row: search, filter dropdown */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 w-full gap-6">
          <div className="flex flex-1">
            <div className="w-full md:w-auto">
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, office, or client type"
                className="max-w-md"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filters:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded px-2 py-2 ml-2"
            >
              {filterOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Results list: surveys with respondents info */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredResponses.length > 0 ? (
              filteredResponses.map((response, i) => (
                <SurveyResponseCard
                  key={i}
                  response={response}
                  onView={() => handleView(response)}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center p-8 rounded border bg-white">
                No matching survey responses found.
              </div>
            )}
          </div>
        )}
        <ResponseDetailsModal
          open={detailsOpen}
          response={selectedResponse}
          onClose={() => setDetailsOpen(false)}
        />
      </main>
    </div>
  );
}
