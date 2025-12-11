"use client"

import { useState } from "react"

export default function AddSurveyQuestionModal({ open, onSave, onCancel }) {
  const [field, setField] = useState({
    section: "Personal Info",
    name: "newField_" + Date.now(),
    type: "text",
    label: "New Question",
    required: false,
    options: [],
    rows: [],
    columns: [],
    instruction: "",
  })

  const [optionInput, setOptionInput] = useState("")
  const [rowInput, setRowInput] = useState("")
  const [columnInput, setColumnInput] = useState("")

  if (!open) return null

  const addOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...(field.options || []), { value: optionInput.toLowerCase(), label: optionInput }]
      setField({ ...field, options: newOptions })
      setOptionInput("")
    }
  }

  const removeOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index)
    setField({ ...field, options: newOptions })
  }

  const addRow = () => {
    if (rowInput.trim()) {
      const newRows = [...(field.rows || []), { name: `row_${Date.now()}`, label: rowInput }]
      setField({ ...field, rows: newRows })
      setRowInput("")
    }
  }

  const removeRow = (index) => {
    const newRows = field.rows.filter((_, i) => i !== index)
    setField({ ...field, rows: newRows })
  }

  const addColumn = () => {
    if (columnInput.trim()) {
      const newColumns = [...(field.columns || []), { label: columnInput, emoji: "📝" }]
      setField({ ...field, columns: newColumns })
      setColumnInput("")
    }
  }

  const removeColumn = (index) => {
    const newColumns = field.columns.filter((_, i) => i !== index)
    setField({ ...field, columns: newColumns })
  }

  const validateBeforeSave = () => {
    if (!field.label.trim()) {
      alert("Question label is required")
      return false
    }

    if (
      (field.type === "select" || field.type === "radio" || field.type === "dropdown") &&
      (!field.options || field.options.length === 0)
    ) {
      alert(
        `${field.type === "dropdown" ? "Dropdown" : field.type === "select" ? "Select" : "Radio"} must have at least one option`,
      )
      return false
    }

    if (field.type === "matrix") {
      if (!field.rows || field.rows.length === 0) {
        alert("Matrix must have at least one row")
        return false
      }
      if (!field.columns || field.columns.length === 0) {
        alert("Matrix must have at least one column")
        return false
      }
    }

    return true
  }

  const handleSave = () => {
    if (validateBeforeSave()) {
      onSave(field)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Question</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new survey question</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Section</label>
            <select
              value={field.section}
              onChange={(e) => setField({ ...field, section: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Personal Info">Personal Info</option>
              <option value="Citizen's Charter Awareness">Citizen's Charter Awareness</option>
              <option value="Service Satisfaction">Service Satisfaction</option>
              <option value="Feedback">Feedback</option>
            </select>
          </div>

          {/* Question Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Question Label *</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => setField({ ...field, label: e.target.value })}
              placeholder="Type your question here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Field Type</label>
            <select
              value={field.type}
              onChange={(e) => setField({ ...field, type: e.target.value, options: [], rows: [], columns: [] })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="text">Short Text</option>
              <option value="textarea">Description</option>
              <option value="radio">Radio Button</option>
              <option value="dropdown">Dropdown</option>
              <option value="matrix">Matrix</option>
            </select>
          </div>

          {/* Options for Radio/Dropdown */}
          {(field.type === "radio" || field.type === "dropdown") && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Options <span className="text-red-600">*Required</span>
              </label>
              <div className="space-y-3 mb-4">
                {field.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                  >
                    <span className="text-gray-700">{opt.label}</span>
                    <button
                      onClick={() => removeOption(idx)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addOption()}
                  placeholder="Enter option..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Matrix Rows and Columns */}
          {field.type === "matrix" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              {/* Rows */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Matrix Rows (Questions) <span className="text-red-600">*Required</span>
                </label>
                <div className="space-y-2 mb-4">
                  {field.rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                    >
                      <span className="text-gray-700">{row.label}</span>
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rowInput}
                    onChange={(e) => setRowInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRow()}
                    placeholder="Enter row..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={addRow}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Columns */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Matrix Columns (Options) <span className="text-red-600">*Required</span>
                </label>
                <div className="space-y-2 mb-4">
                  {field.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                    >
                      <span className="text-gray-700">{col.label}</span>
                      <button
                        onClick={() => removeColumn(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={columnInput}
                    onChange={(e) => setColumnInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addColumn()}
                    placeholder="Enter column label..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={addColumn}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Instructions (Optional)</label>
            <textarea
              value={field.instruction || ""}
              onChange={(e) => setField({ ...field, instruction: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Add instruction text..."
              rows={3}
            />
          </div>

          {/* Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => setField({ ...field, required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
              id="required"
            />
            <label htmlFor="required" className="ml-3 text-sm font-semibold text-gray-900">
              This question is required
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Add Question
          </button>
        </div>
      </div>
    </div>
  )
}
