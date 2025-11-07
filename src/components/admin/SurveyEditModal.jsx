// src/components/admin/SurveyEditModal.jsx
import React, { useState, useEffect } from "react";

export default function SurveyEditModal({ open, survey, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    status: "",
    creator: "",
    responses: 0,
  });

  useEffect(() => {
    if (survey) {
      setForm(survey);
    } else {
      setForm({
        title: "",
        status: "Draft",
        creator: "Admin",
        responses: 0,
      });
    }
  }, [survey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">
          {survey ? "Edit" : "Create"} Survey
        </h3>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="Survey Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Creator"
            value={form.creator}
            onChange={(e) => setForm({ ...form, creator: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSave(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
