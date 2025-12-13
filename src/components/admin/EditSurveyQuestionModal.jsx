import { useState, useEffect } from "react"

export default function EditSurveyQuestionModal({ open, field, onSave, onCancel, onChange, section }) {
  const [optionInput, setOptionInput] = useState("")
  const [rowInput, setRowInput] = useState("")
  const [columnInput, setColumnInput] = useState("")

  useEffect(() => {
    if (!open) {
      setOptionInput("")
      setRowInput("")
      setColumnInput("")
    }
  }, [open])

  if (!field || !open) return null

  const addOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...(field.options || []), { value: optionInput.toLowerCase(), label: optionInput }]
      onChange({ ...field, options: newOptions })
      setOptionInput("")
    }
  }

  const removeOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index)
    onChange({ ...field, options: newOptions })
  }

  const addRow = () => {
    if (rowInput.trim()) {
      const newRows = [...(field.rows || []), { name: `row_${Date.now()}`, label: rowInput }]
      onChange({ ...field, rows: newRows })
      setRowInput("")
    }
  }

  const removeRow = (index) => {
    const newRows = field.rows.filter((_, i) => i !== index)
    onChange({ ...field, rows: newRows })
  }

  const addColumn = () => {
    if (columnInput.trim()) {
      const emojiMap = {
        "strongly disagree": "😡",
        disagree: "😞",
        neither: "😐",
        agree: "😊",
        "strongly agree": "😄",
        "n/a": "➖",
        "not applicable": "➖",
      }
      const lowerInput = columnInput.toLowerCase()
      let emoji = "📝"
      for (const [key, val] of Object.entries(emojiMap)) {
        if (lowerInput.includes(key)) {
          emoji = val
          break
        }
      }
      const newColumns = [...(field.columns || []), { label: columnInput, emoji, value: columnInput }]
      onChange({ ...field, columns: newColumns })
      setColumnInput("")
    }
  }

  const removeColumn = (index) => {
    const newColumns = field.columns.filter((_, i) => i !== index)
    onChange({ ...field, columns: newColumns })
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
      onSave()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const isMatrixQuestion = field.type === "matrix"

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Question</h2>
            <p className="text-sm text-gray-600 mt-1">Update survey question details</p>
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
              onChange={(e) => onChange({ ...field, section: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Personal Info">Personal Info</option>
              <option value="Citizen's Charter Awareness">Citizen's Charter Awareness</option>
              <option value="Service Satisfaction">Service Satisfaction</option>
              <option value="Feedback">Feedback</option>
            </select>
          </div>

          {/* Question Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Question</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder="Type Question Here"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Field Type</label>
            <select
              value={field.type}
              onChange={(e) => onChange({ ...field, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Short Text</option>
              <option value="textarea">Description</option>
              <option value="radio">Radio Button</option>
              <option value="dropdown">Dropdown</option>
              <option value="matrix">Matrix</option>
            </select>
          </div>

          {/* Options for radio/dropdown - Only shown for non-matrix questions */}
          {!isMatrixQuestion && (field.type === "radio" || field.type === "dropdown") && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Options <span className="text-red-600">*Required</span>
              </label>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {field.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                  >
                    <span className="text-gray-700 flex-1">{option.label}</span>
                    <button
                      onClick={() => removeOption(idx)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg ml-2"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {isMatrixQuestion && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              {/* Rows */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Matrix Rows (Questions) <span className="text-red-600">*Required</span>
                </label>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {field.rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                    >
                      <span className="text-gray-700 flex-1">{row.label}</span>
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg ml-2"
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
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addRow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
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
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {field.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded p-3"
                    >
                      <span className="text-gray-700 flex-1">
                        {col.emoji} {col.label}
                      </span>
                      <button
                        onClick={() => removeColumn(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg ml-2"
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
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addColumn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Required Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.is_required || false}
              onChange={(e) => {
                onChange({ ...field, is_required: e.target.checked })
              }}
              className="w-4 h-4 rounded border-gray-300"
              id={isMatrixQuestion ? "required-matrix" : "required"}
            />
            <label
              htmlFor={isMatrixQuestion ? "required-matrix" : "required"}
              className="ml-3 text-sm font-semibold text-gray-900"
            >
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
