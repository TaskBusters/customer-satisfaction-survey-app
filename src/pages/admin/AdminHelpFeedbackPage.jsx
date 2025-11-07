import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import HelpFaqModal from "../../components/survey/HelpFaqModal";
import SearchBar from "../../components/admin/SearchBar";

// Replace with real data or backend fetch
const FAKE_FEEDBACK = [
  { title: "App is easy to use" },
  { title: "Feature request: dark mode" },
  { title: "Bug: password reset not working" },
  { title: "Survey instructions too brief" },
  { title: "Loading time needs improvement" },
  { title: "Add language switching" },
  { title: "Too many required questions" },
  { title: "Mobile layout is broken" },
  { title: "Suggestion: export results to Excel" },
  { title: "Notification emails arrive late" },
  { title: "Add more dashboard widgets" },
  { title: "Dates display in US format" },
  { title: "Can’t find my previous survey" },
  { title: "Make feedback anonymous" },
  { title: "Graphs are hard to read" },
  { title: "Cannot attach a file" },
  { title: "Request: Print button on results" },
  { title: "Number entry field is confusing" },
  { title: "Admins can’t edit survey title" },
  { title: "Long survey hangs or freezes" },
  { title: "Sorting doesn’t work on responses" },
  { title: "Please allow multi-select answers" },
  { title: "Auto-save loses my changes sometimes" },
  { title: "Success toast is hard to see" },
  { title: "Accent colors are off-brand" },
];

export default function AdminHelpFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [faqs, setFaqs] = useState([
    { question: "How do I reset my password?", answer: "Go to settings..." },
    { question: "How do I contact support?", answer: "Email support@..." },
  ]);

  useEffect(() => {
    setTimeout(() => setFeedback(FAKE_FEEDBACK), 350);
  }, []);

  const filteredFeedback = feedback.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="font-bold text-2xl">Help & Feedback</div>
          <div className="w-full max-w-xl flex justify-end">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full"
            />
          </div>
        </div>
        <div className="mb-5">
          <div className="font-semibold mb-2">Manage FAQs</div>
          <button
            className="border rounded px-6 py-1 font-semibold bg-white hover:bg-gray-100 transition"
            onClick={() => setFaqOpen(true)}
          >
            Edit
          </button>
          <HelpFaqModal
            open={faqOpen}
            faqs={faqs}
            onSave={(newFaqs) => {
              setFaqs(newFaqs);
              setFaqOpen(false);
            }}
            onClose={() => setFaqOpen(false)}
          />
        </div>

        <div className="font-semibold mb-2">Review Feedback</div>
        <div
          className="border rounded bg-gray-50 p-4 overflow-y-auto text-gray-900 flex flex-col"
          style={{ minHeight: "50vh", height: "calc(100vh - 320px)" }}
        >
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item, idx) => (
              <div
                key={item.title}
                className="mb-3 last:mb-0 p-3 border rounded bg-white "
              >
                {item.title}
              </div>
            ))
          ) : (
            <div className="text-gray-200 text-center p-6">
              No Feedback found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
