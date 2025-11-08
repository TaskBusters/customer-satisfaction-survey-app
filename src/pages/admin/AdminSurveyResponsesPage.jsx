import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SearchBar from "../../components/admin/SearchBar";
import SurveyResponseCard from "../../components/admin/SurveyResponseCard";
import NotificationBar from "../../components/admin/NotificationBar";
import ResponseDetailsModal from "../../components/admin/ResponseDetailsModal";

// All respondents in respondentsDetails (adjust and expand as needed)
const FAKE_RESPONSES = [
  {
    title: "Customer Satisfaction Survey",
    office: "Maysan Barangay Hall",
    date: "11/01/25",
    clientType: "Resident",
    respondents: 10,
    respondentsDetails: [
      {
        fullName: "Rafael Cruz",
        email: "rafael.cruz@example.com",
        district: "District 2",
        barangay: "Malanday",
        responses: {
          "Client Type": "Resident",
          Gender: "Male",
          Age: 27,
          "Region of Residence": "Region IV",
          "Service Availed": "Tax Clearance",
          ccAwareness: "Yes",
          ccVisibility: "Yes, posters",
          ccHelpfulness: "Moderately helpful",
          Suggestions: "Add more payment counters.",
          Email: "rafael.cruz@example.com",
          Rating: {
            SQD0: 4,
            SQD1: 4,
            SQD2: 4,
            SQD3: 5,
            SQD4: 3,
            SQD5: 4,
            SQD6: 4,
            SQD7: 5,
            SQD8: 4,
          },
        },
      },
      {
        fullName: "Lourdes Dizon",
        email: "lou.dizon@example.com",
        district: "District 1",
        barangay: "Pariancillo Villa",
        responses: {
          "Client Type": "Business Owner",
          Gender: "Female",
          Age: 41,
          "Region of Residence": "NCR",
          "Service Availed": "Market Stall Permit",
          ccAwareness: "No",
          ccVisibility: "Not aware",
          ccHelpfulness: "",
          Suggestions: "Improve signage to help new clients find the office.",
          Email: "lou.dizon@example.com",
          Rating: {
            SQD0: 3,
            SQD1: 2,
            SQD2: 3,
            SQD3: 2,
            SQD4: 1,
            SQD5: 2,
            SQD6: 2,
            SQD7: 3,
            SQD8: 1,
          },
        },
      },
      {
        fullName: "Enzo Manalo",
        email: "enz.manalo@gmail.com",
        district: "District 3",
        barangay: "Dalandanan",
        responses: {
          "Client Type": "Resident",
          Gender: "Male",
          Age: 51,
          "Region of Residence": "Region III",
          "Service Availed": "Barangay Clearance",
          ccAwareness: "Yes",
          ccVisibility: "Social Media",
          ccHelpfulness: "Very helpful",
          Suggestions: "Open earlier on weekends for working people.",
          Email: "enz.manalo@gmail.com",
          Rating: {
            SQD0: 5,
            SQD1: 5,
            SQD2: 4,
            SQD3: 5,
            SQD4: 5,
            SQD5: 4,
            SQD6: 5,
            SQD7: 4,
            SQD8: 5,
          },
        },
      },
      {
        fullName: "April Lopez",
        email: "april.lopez@yahoo.com",
        district: "District 2",
        barangay: "Canumay East",
        responses: {
          "Client Type": "Senior",
          Gender: "Female",
          Age: 62,
          "Region of Residence": "Region II",
          "Service Availed": "Senior Discount Card",
          ccAwareness: "Yes",
          ccVisibility: "Radio Announcements",
          ccHelpfulness: "Somewhat helpful",
          Suggestions: "Have senior priority lane in all offices.",
          Email: "april.lopez@yahoo.com",
          Rating: {
            SQD0: 3,
            SQD1: 3,
            SQD2: 2,
            SQD3: 3,
            SQD4: 2,
            SQD5: 2,
            SQD6: 3,
            SQD7: 3,
            SQD8: 2,
          },
        },
      },
      {
        fullName: "Mico Ramos",
        email: "m.ramos2010@gmail.com",
        district: "District 1",
        barangay: "Balangkas",
        responses: {
          "Client Type": "OFW Dependent",
          Gender: "Male",
          Age: 19,
          "Region of Residence": "NCR",
          "Service Availed": "Passport Endorsement",
          ccAwareness: "No",
          ccVisibility: "Not aware",
          ccHelpfulness: "",
          Suggestions: "Faster processing for urgent travel needs.",
          Email: "m.ramos2010@gmail.com",
          Rating: {
            SQD0: 2,
            SQD1: 2,
            SQD2: 3,
            SQD3: 1,
            SQD4: 2,
            SQD5: 1,
            SQD6: 2,
            SQD7: 3,
            SQD8: 2,
          },
        },
      },
      {
        fullName: "Miguel Antonio",
        email: "miguel.antonio@email.com",
        district: "District 1",
        barangay: "Bignay",
        responses: {
          "Client Type": "Resident",
          Gender: "Male",
          Age: 42,
          "Region of Residence": "Region IV",
          "Service Availed": "Barangay Clearance",
          ccAwareness: "Yes",
          ccVisibility: "Radio Announcements",
          ccHelpfulness: "Extremely helpful",
          Suggestions: "Extend service hours for working people.",
          Email: "miguel.antonio@email.com",
          Rating: {
            SQD0: 4,
            SQD1: 4,
            SQD2: 4,
            SQD3: 3,
            SQD4: 5,
            SQD5: 5,
            SQD6: 5,
            SQD7: 4,
            SQD8: 4,
          },
        },
      },
      {
        fullName: "Arlene Dimalanta",
        email: "arlene.dimalanta@email.com",
        district: "District 2",
        barangay: "Rincon",
        responses: {
          "Client Type": "Resident",
          Gender: "Female",
          Age: 38,
          "Region of Residence": "NCR",
          "Service Availed": "Business Permit",
          ccAwareness: "No",
          ccVisibility: "Not aware",
          ccHelpfulness: "",
          Suggestions: "Please provide more seating.",
          Email: "arlene.dimalanta@email.com",
          Rating: {
            SQD0: 3,
            SQD1: 3,
            SQD2: 3,
            SQD3: 3,
            SQD4: 3,
            SQD5: 2,
            SQD6: 4,
            SQD7: 3,
            SQD8: 3,
          },
        },
      },
      {
        fullName: "Kristoffer Ramos",
        email: "k.ramos@email.com",
        district: "District 1",
        barangay: "Punturin",
        responses: {
          "Client Type": "Resident",
          Gender: "Male",
          Age: 26,
          "Region of Residence": "Region III",
          "Service Availed": "Birth Certificate",
          ccAwareness: "Yes",
          ccVisibility: "Social Media",
          ccHelpfulness: "Helpful",
          Suggestions: "The only issue was queueing for photocopies.",
          Email: "k.ramos@email.com",
          Rating: {
            SQD0: 5,
            SQD1: 5,
            SQD2: 4,
            SQD3: 4,
            SQD4: 5,
            SQD5: 5,
            SQD6: 4,
            SQD7: 4,
            SQD8: 5,
          },
        },
      },
      {
        fullName: "Jessica Lagman",
        email: "jess.lagman@email.com",
        district: "District 2",
        barangay: "Balangkas",
        responses: {
          "Client Type": "Resident",
          Gender: "Female",
          Age: 31,
          "Region of Residence": "Region IV",
          "Service Availed": "Indigency Certificate",
          ccAwareness: "Yes",
          ccVisibility: "Radio Announcements",
          ccHelpfulness: "Very helpful",
          Suggestions:
            "The aircon was a bit weak, but overall very good experience.",
          Email: "jess.lagman@email.com",
          Rating: {
            SQD0: 4,
            SQD1: 3,
            SQD2: 4,
            SQD3: 5,
            SQD4: 4,
            SQD5: 3,
            SQD6: 5,
            SQD7: 4,
            SQD8: 5,
          },
        },
      },
      {
        fullName: "April Santos",
        email: "april.santos@email.com",
        district: "District 3",
        barangay: "Riverside",
        responses: {
          "Client Type": "Resident",
          Gender: "Female",
          Age: 57,
          "Region of Residence": "NCR",
          "Service Availed": "Cedula Application",
          ccAwareness: "Yes",
          ccVisibility: "Posters",
          ccHelpfulness: "Not helpful",
          Suggestions: "Wish application time was shorter.",
          Email: "april.santos@email.com",
          Rating: {
            SQD0: 2,
            SQD1: 2,
            SQD2: 3,
            SQD3: 1,
            SQD4: 2,
            SQD5: 1,
            SQD6: 2,
            SQD7: 3,
            SQD8: 2,
          },
        },
      },
    ],
  },
];

const filterOptions = [
  { label: "Date", key: "date" },
  { label: "Office", key: "office" },
  { label: "Client Type", key: "Client Type" },
  { label: "Gender", key: "Gender" },
  { label: "Age", key: "Age" },
  { label: "Region", key: "Region of Residence" },
  { label: "Service Availed", key: "Service Availed" },
  { label: "CC Awareness", key: "ccAwareness" },
  { label: "CC Visibility", key: "ccVisibility" },
  { label: "CC Helpfulness", key: "ccHelpfulness" },
];

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

  const filteredResponses = responses
    .map((survey) => {
      const filteredRespondents = survey.respondentsDetails.filter((rd) => {
        // 🔹 selectedFilter.key refers to "date", "office", or "clientType"
        const fieldValue =
          survey[selectedFilter.key] ||
          rd.responses?.[selectedFilter.key] ||
          "";

        return fieldValue
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase());
      });

      return {
        ...survey,
        respondentsDetails: filteredRespondents,
        respondents: filteredRespondents.length, // Updates respondent count dynamically
      };
    })
    .filter((survey) => survey.respondentsDetails.length > 0);

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
              value={selectedFilter.key}
              onChange={(e) =>
                setSelectedFilter(
                  filterOptions.find((fo) => fo.key === e.target.value)
                )
              }
              className="border rounded px-2 py-2 ml-2"
            >
              {filterOptions.map((option) => (
                <option value={option.key} key={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Scrollable response cards, responsive and neat */}
        <div className="flex flex-col gap-6 max-h-[calc(100vh-240px)] overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-20">Loading...</div>
          ) : filteredResponses.length > 0 ? (
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
        <ResponseDetailsModal
          open={detailsOpen}
          response={selectedResponse}
          onClose={() => setDetailsOpen(false)}
        />
      </main>
    </div>
  );
}
