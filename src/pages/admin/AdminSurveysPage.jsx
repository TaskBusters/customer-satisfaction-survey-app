import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SurveyStats from "../../components/admin/SurveyStats.jsx";
import SurveyList from "../../components/admin/SurveyList";
import SurveyEditModal from "../../components/admin/SurveyEditModal";
import SearchBar from "../../components/admin/SearchBar.jsx";

const FAKE_STATS = {
  surveys: { active: 7, drafts: 0, closed: 30 },
};

const FAKE_SURVEYS = [
  {
    title: "Customer Satisfaction Survey",
    status: "Active",
    responses: 19,
    creator: "Admin 2",
    lastModified: "10/29/2025",
    canEdit: true,
  },
  {
    title: "Untitled 01",
    status: "Draft",
    responses: 0,
    creator: "Admin",
    lastModified: "10/20/2025",
    canEdit: true,
  },
];

export default function AdminSurveysPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setStats(FAKE_STATS);
      setSurveys(FAKE_SURVEYS);
      setLoading(false);
    }, 350);
  }, []);

  // CRUD handlers
  const handleCreate = () => {
    setEditingSurvey(null);
    setModalOpen(true);
  };
  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setModalOpen(true);
  };
  const handleDelete = (survey) => {
    if (window.confirm(`Delete survey "${survey.title}"?`)) {
      setSurveys(surveys.filter((s) => s !== survey));
    }
  };
  const handleSave = (newSurvey) => {
    if (editingSurvey) {
      setSurveys(surveys.map((s) => (s === editingSurvey ? newSurvey : s)));
    } else {
      setSurveys([
        {
          ...newSurvey,
          canEdit: true,
          responses: 0,
          lastModified: new Date().toLocaleDateString(),
        },
        ...surveys,
      ]);
    }
    setModalOpen(false);
  };

  // Filter surveys based on search
  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : (
          <>
            <div className="mb-6 flex w-full">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="max-w-md"
                />
              </div>
              <button
                className="ml-4 px-5 py-2 border rounded font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                onClick={handleCreate}
              >
                + Create Survey
              </button>
              <button className="ml-2 px-5 py-2 border rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">
                Publish
              </button>
            </div>
            <SurveyList
              surveys={filteredSurveys}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <SurveyEditModal
              open={modalOpen}
              survey={editingSurvey}
              onSave={handleSave}
              onClose={() => setModalOpen(false)}
            />
          </>
        )}
      </main>
    </div>
  );
}
