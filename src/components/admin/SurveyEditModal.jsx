import React, { useState, useEffect } from "react";

export default function SurveyEditModal({ open, survey, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    status: "Draft",
    creator: "Admin",
    responses: 0,
    sections: [],
  });

  useEffect(() => {
    if (survey) {
      setForm({
        ...survey,
        sections: Array.isArray(survey.sections)
          ? survey.sections.map((sec) => ({
              ...sec,
              instructions:
                typeof sec.instructions === "string" ? sec.instructions : "",
              questions: Array.isArray(sec.questions) ? sec.questions : [],
            }))
          : [],
      });
    } else {
      setForm({
        title: "",
        status: "Draft",
        creator: "Admin",
        responses: 0,
        sections: [],
      });
    }
  }, [survey]);

  if (!open) return null;

  const handleSectionTitleChange = (idx, value) => {
    const updatedSections = [...form.sections];
    updatedSections[idx].title = value;
    setForm({ ...form, sections: updatedSections });
  };

  const handleSectionInstructionsChange = (idx, value) => {
    const updatedSections = [...form.sections];
    updatedSections[idx].instructions = value;
    setForm({ ...form, sections: updatedSections });
  };

  const handleQuestionChange = (sIdx, qIdx, field, value) => {
    const updatedSections = [...form.sections];
    updatedSections[sIdx].questions[qIdx][field] = value;
    setForm({ ...form, sections: updatedSections });
  };

  const addSection = () => {
    setForm({
      ...form,
      sections: [
        ...(form.sections ?? []),
        { title: "", instructions: "", questions: [] },
      ],
    });
  };

  const removeSection = (idx) => {
    const updatedSections = (form.sections ?? []).filter((_, i) => i !== idx);
    setForm({ ...form, sections: updatedSections });
  };

  const addQuestion = (sIdx) => {
    const updatedSections = [...form.sections];
    updatedSections[sIdx].questions = [
      ...(updatedSections[sIdx].questions ?? []),
      { label: "", type: "text" }, // Default to text, but user can change to textarea/radio/select
    ];
    setForm({ ...form, sections: updatedSections });
  };

  const removeQuestion = (sIdx, qIdx) => {
    const updatedSections = [...form.sections];
    updatedSections[sIdx].questions = (
      updatedSections[sIdx].questions ?? []
    ).filter((_, i) => i !== qIdx);
    setForm({ ...form, sections: updatedSections });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
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
        {/* Sections Editing */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-semibold">Sections</label>
            <button
              type="button"
              className="px-2 py-1 bg-green-500 text-white text-sm rounded"
              onClick={addSection}
            >
              + Add Section
            </button>
          </div>
          {(form.sections ?? []).map((section, sIdx) => (
            <div key={sIdx} className="border rounded p-2 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) =>
                    handleSectionTitleChange(sIdx, e.target.value)
                  }
                  className="border rounded p-1 flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSection(sIdx)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  Remove
                </button>
              </div>
              <textarea
                placeholder="Instructions (optional)"
                value={section.instructions}
                onChange={(e) =>
                  handleSectionInstructionsChange(sIdx, e.target.value)
                }
                className="border rounded p-1 w-full mb-2"
                rows={2}
              />
              {/* Questions Editing */}
              <div className="mb-2">
                <label className="font-medium text-sm mb-1">Questions:</label>
                <button
                  type="button"
                  className="ml-3 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                  onClick={() => addQuestion(sIdx)}
                >
                  + Add Question
                </button>
              </div>
              {(section.questions ?? []).map((q, qIdx) => (
                <div key={qIdx} className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    placeholder="Question Label"
                    value={q.label}
                    onChange={(e) =>
                      handleQuestionChange(sIdx, qIdx, "label", e.target.value)
                    }
                    className="border rounded p-1 flex-1"
                  />
                  <select
                    value={q.type}
                    onChange={(e) =>
                      handleQuestionChange(sIdx, qIdx, "type", e.target.value)
                    }
                    className="border rounded p-1"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeQuestion(sIdx, qIdx)}
                    className="px-2 py-1 bg-gray-300 text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))}
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
