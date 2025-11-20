"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useAuth } from "../../context/AuthContext"
import { logAdminAction } from "../../utils/adminLogger"
import fields from "../../survey/surveyFields"
import { API_BASE_URL } from "../../utils/api.js"
import { canEditSurvey } from "../../utils/roleUtils"

// Helper to ensure emojis are present in matrix columns
const ensureEmojis = (columns) => {
  if (!columns || !Array.isArray(columns)) return columns
  const emojiMap = {
    1: "😡",
    2: "😞",
    3: "😐",
    4: "😊",
    5: "😄",
    NA: "➖",
  }
  return columns.map((col) => {
    // If emoji is missing, add it based on value
    if (!col.emoji && emojiMap[col.value]) {
      return {
        ...col,
        emoji: emojiMap[col.value],
      }
    }
    return col
  })
}

export default function AdminSurveysPage() {
  const { user } = useAuth()
  const canEdit = canEditSurvey(user?.role)
  const [loading, setLoading] = useState(true)
  const [published, setPublished] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [surveys, setSurveys] = useState(fields)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    // Load questions from database
    fetch(`${API_BASE_URL}/api/admin/survey-questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          // Convert database format to field format
          const convertedFields = data.map((q) => {
            // Parse JSON strings if they exist
            let options = []
            let rows = []
            let columns = []

            try {
              if (q.options) {
                options = typeof q.options === "string" ? JSON.parse(q.options) : q.options
              }
              if (q.rows) {
                rows = typeof q.rows === "string" ? JSON.parse(q.rows) : q.rows
              }
              if (q.columns) {
                columns = typeof q.columns === "string" ? JSON.parse(q.columns) : q.columns
              }
            } catch (e) {
              console.error("Error parsing field data:", e)
            }

            // Ensure emojis are present in matrix columns
            let restoredColumns = columns || []
            if (q.field_type === "matrix" && restoredColumns.length > 0) {
              restoredColumns = ensureEmojis(restoredColumns)
            }

            return {
              section: q.section,
              name: q.field_name,
              type: q.field_type,
              label: q.question_text,
              required: q.is_required !== 0,
              options: options || [],
              rows: rows || [],
              columns: restoredColumns,
              instruction: q.instruction || "",
            }
          })
          setSurveys(convertedFields)
        } else {
          // If no questions in DB, save default fields
          saveFieldsToDatabase(fields)
          setSurveys(fields)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load questions:", err)
        setSurveys(fields)
        setLoading(false)
      })
  }, [])

  const saveFieldsToDatabase = async (fieldsToSave) => {
    for (const field of fieldsToSave) {
      try {
        // Ensure emojis are present in columns
        const columnsWithEmojis = ensureEmojis(field.columns || [])

        await fetch(`${API_BASE_URL}/api/admin/survey-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field_name: field.name,
            section: field.section,
            question_text: field.label,
            field_type: field.type,
            is_required: field.required !== false,
            options: JSON.stringify(field.options || []),
            rows: JSON.stringify(field.rows || []),
            columns: JSON.stringify(columnsWithEmojis),
            instruction: field.instruction || "",
          }),
        })
      } catch (err) {
        console.error("Failed to save field:", err)
      }
    }
  }

  const handleEditField = (field) => {
    setEditingField({ ...field })
    setShowModal(true)
  }

  const handleSaveField = async () => {
    if (!editingField) return

    try {
      // Ensure emojis are present in columns
      const columnsWithEmojis = ensureEmojis(editingField.columns || [])

      // Save to database - stringify arrays for storage
      const response = await fetch(`${API_BASE_URL}/api/admin/survey-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_name: editingField.name,
          section: editingField.section,
          question_text: editingField.label,
          field_type: editingField.type,
          is_required: editingField.required !== false,
          options: JSON.stringify(editingField.options || []),
          rows: JSON.stringify(editingField.rows || []),
          columns: JSON.stringify(columnsWithEmojis),
          instruction: editingField.instruction || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save question")
      }

      // Reload questions from database to get the latest data
      const res = await fetch(`${API_BASE_URL}/api/admin/survey-questions`)
      const data = await res.json()

      if (data && data.length > 0) {
        const convertedFields = data.map((q) => {
          let options = []
          let rows = []
          let columns = []

          try {
            if (q.options) {
              options = typeof q.options === "string" ? JSON.parse(q.options) : q.options
            }
            if (q.rows) {
              rows = typeof q.rows === "string" ? JSON.parse(q.rows) : q.rows
            }
            if (q.columns) {
              columns = typeof q.columns === "string" ? JSON.parse(q.columns) : q.columns
            }
          } catch (e) {
            console.error("Error parsing field data:", e)
          }

          return {
            section: q.section,
            name: q.field_name,
            type: q.field_type,
            label: q.question_text,
            required: q.is_required !== 0,
            options: options || [],
            rows: rows || [],
            columns: columns || [],
            instruction: q.instruction || "",
          }
        })
        setSurveys(convertedFields)
      }

      // Check if this is a new question or an edit
      const isNewQuestion = editingField.name.startsWith("newField_")
      const actionText = isNewQuestion ? "Added new survey question" : "Edited survey question"
      await logAdminAction(user.email, user.fullName, `${actionText}: ${editingField.label}`)

      setSaveMessage("Question saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
      setShowModal(false)
      setEditingField(null)

      // Reload logs in dashboard if it's open
      window.dispatchEvent(new CustomEvent("reloadLogs"))
    } catch (err) {
      console.error("Save error:", err)
      setSaveMessage("Failed to save question!")
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const handleAddField = () => {
    setEditingField({
      section: "Feedback",
      name: "newField_" + Date.now(),
      type: "text",
      label: "New Field",
      required: false,
      options: [],
    })
    setShowModal(true)
  }

  const handlePublish = async () => {
    if (window.confirm("Publish this survey to make it live on the website?")) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "survey_published", value: "true" }),
        })
        setPublished(true)
        await logAdminAction(user.email, user.fullName, "Published survey - Now live on website")
        setSaveMessage("Survey published successfully!")
        setTimeout(() => setSaveMessage(""), 3000)

        // Reload logs in dashboard if it's open
        window.dispatchEvent(new CustomEvent("reloadLogs"))
      } catch (err) {
        setSaveMessage("Failed to publish survey!")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    }
  }

  const handleUnpublish = async () => {
    if (window.confirm("Unpublish this survey? It will no longer appear on the website.")) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "survey_published", value: "false" }),
        })
        setPublished(false)
        await logAdminAction(user.email, user.fullName, "Unpublished survey - Removed from website")
        setSaveMessage("Survey unpublished.")
        setTimeout(() => setSaveMessage(""), 3000)

        // Reload logs in dashboard if it's open
        window.dispatchEvent(new CustomEvent("reloadLogs"))
      } catch (err) {
        setSaveMessage("Failed to unpublish survey!")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    }
  }

  useEffect(() => {
    // Check publish status
    fetch(`${API_BASE_URL}/api/admin/settings`)
      .then((res) => res.json())
      .then((data) => {
        setPublished(data.survey_published === "true")
      })
      .catch(() => {})
  }, [])

  const handleDeleteField = async (fieldName) => {
    if (window.confirm("Delete this field?")) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/survey-questions/${fieldName}`, {
          method: "DELETE",
        })
        setSurveys(surveys.filter((f) => f.name !== fieldName))
        await logAdminAction(user.email, user.fullName, `Deleted survey question: ${fieldName}`)
        setSaveMessage("Question deleted successfully!")
        setTimeout(() => setSaveMessage(""), 3000)

        // Reload logs in dashboard if it's open
        window.dispatchEvent(new CustomEvent("reloadLogs"))
      } catch (err) {
        setSaveMessage("Failed to delete question!")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    }
  }

  const fieldsBySection = {}
  surveys.forEach((field) => {
    if (!fieldsBySection[field.section]) {
      fieldsBySection[field.section] = []
    }
    fieldsBySection[field.section].push(field)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center text-gray-500">Loading...</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Manager</h1>
              <p className="text-gray-600 mt-1">Edit questions and manage survey publication</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddField}
                disabled={!canEdit}
                className={`px-5 py-2 bg-green-600 text-white rounded font-semibold transition ${
                  canEdit ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed"
                }`}
              >
                + Add Question
              </button>
              {!published ? (
                <button
                  onClick={handlePublish}
                  disabled={!canEdit}
                  className={`px-5 py-2 bg-blue-600 text-white rounded font-semibold transition ${
                    canEdit ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Publish Survey
                </button>
              ) : (
                <button
                  onClick={handleUnpublish}
                  disabled={!canEdit}
                  className={`px-5 py-2 bg-orange-600 text-white rounded font-semibold transition ${
                    canEdit ? "hover:bg-orange-700" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Unpublish Survey
                </button>
              )}
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-semibold">
              {saveMessage}
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Survey Status:</span>{" "}
              {published ? (
                <span className="text-green-600 font-bold">Live on Website</span>
              ) : (
                <span className="text-orange-600 font-bold">Draft - Not Published</span>
              )}
            </p>
          </div>

          {/* Survey Questions by Section */}
          <div className="space-y-6">
            {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
              <div key={section} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                  <h2 className="font-bold text-lg">{section}</h2>
                </div>
                <div className="divide-y">
                  {sectionFields.map((field) => {
                    if (field.type === "matrix" && field.rows && field.rows.length > 0) {
                      return (
                        <div key={field.name}>
                          {/* Show matrix header and instruction */}
                          <div className="px-6 py-4 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-900">{field.label}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: <span className="font-medium">Matrix</span>
                              {field.required && <span className="text-red-600 ml-2">*Required</span>}
                            </p>
                            {field.instruction && (
                              <p className="text-sm text-gray-600 mt-2 italic">{field.instruction}</p>
                            )}
                          </div>
                          {/* Show each row as an individual editable item */}
                          {field.rows.map((row, rowIdx) => (
                            <div
                              key={`${field.name}-${rowIdx}`}
                              className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{row.name}</div>
                                <h4 className="font-medium text-gray-900">{row.label}</h4>
                                {/* Show field type and required indicator for consistency with other questions */}
                                <p className="text-sm text-gray-600 mt-1">
                                  Type: <span className="font-medium">Matrix</span>
                                  {field.required && <span className="text-red-600 ml-2">*Required</span>}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    // When editing a row, set the field for editing
                                    setEditingField({ ...field, editingRowIndex: rowIdx })
                                    setShowModal(true)
                                  }}
                                  disabled={!canEdit}
                                  className={`px-4 py-2 border rounded font-semibold transition text-sm ${
                                    canEdit
                                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                      : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Edit
                                </button>
                                {/* Added Delete button for each SQD question */}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete this SQD question: ${row.label}?`)) {
                                      const updatedRows = field.rows.filter((_, idx) => idx !== rowIdx)
                                      const updatedField = { ...field, rows: updatedRows }
                                      setEditingField(updatedField)
                                      // Save the updated field
                                      handleSaveField.call({ ...field, rows: updatedRows })
                                    }
                                  }}
                                  disabled={!canEdit}
                                  className={`px-4 py-2 border rounded font-semibold transition text-sm ${
                                    canEdit
                                      ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                      : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    } else {
                      // Non-matrix fields display as before
                      return (
                        <div
                          key={field.name}
                          className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{field.label}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: <span className="font-medium">{field.type}</span>
                              {field.required && <span className="text-red-600 ml-2">*Required</span>}
                            </p>
                            {field.instruction && (
                              <p className="text-sm text-gray-600 mt-2 italic">{field.instruction}</p>
                            )}
                            {field.options && field.options.length > 0 && (
                              <p className="text-sm text-gray-600 mt-2">
                                Options: {field.options.map((o) => o.label).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditField(field)}
                              disabled={!canEdit}
                              className={`px-4 py-2 border rounded font-semibold transition text-sm ${
                                canEdit
                                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                  : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteField(field.name)}
                              disabled={!canEdit}
                              className={`px-4 py-2 border rounded font-semibold transition text-sm ${
                                canEdit
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                  : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && (
          <FieldEditModal
            field={editingField}
            onSave={handleSaveField}
            onCancel={() => {
              setShowModal(false)
              setEditingField(null)
            }}
            onChange={setEditingField}
          />
        )}
      </main>
    </div>
  )
}

function FieldEditModal({ field, onSave, onCancel, onChange }) {
  const [optionInput, setOptionInput] = useState("")

  if (!field) return null

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

  const handleRowLabelChange = (index, newLabel) => {
    const updatedRows = (field.rows || []).map((row, idx) => (idx === index ? { ...row, label: newLabel } : row))
    onChange({ ...field, rows: updatedRows })
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const rowToEdit = field.editingRowIndex !== undefined ? field.editingRowIndex : null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700 pr-8">
          {field.type === "matrix" && rowToEdit !== null ? "Edit SQD Question" : "Edit Question"}
        </h2>

        <div className="space-y-4">
          {field.type === "matrix" && rowToEdit !== null ? (
            <>
              <div>
                <label className="block font-semibold mb-2">SQD Question</label>
                <p className="text-sm text-gray-600 mb-3">Edit the question text for {field.rows[rowToEdit].name}</p>
                <input
                  type="text"
                  value={field.rows[rowToEdit].label || ""}
                  onChange={(e) => handleRowLabelChange(rowToEdit, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter question text"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold mb-2">Section</label>
                <select
                  value={field.section}
                  onChange={(e) => onChange({ ...field, section: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option>Personal Info</option>
                  <option>Citizen's Charter Awareness</option>
                  <option>Service Satisfaction</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Question Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onChange({ ...field, label: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Field Type</label>
                <select
                  value={field.type}
                  onChange={(e) => onChange({ ...field, type: e.target.value, options: [] })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="select">Dropdown</option>
                  <option value="radio">Radio Button</option>
                  <option value="textarea">Text Area</option>
                  <option value="matrix">Matrix</option>
                </select>
              </div>

              {(field.type === "select" || field.type === "radio") && (
                <div>
                  <label className="block font-semibold mb-2">Options</label>
                  <div className="space-y-2 mb-3">
                    {field.options && field.options.length > 0 ? (
                      field.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{opt.label}</span>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No options added yet</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addOption()}
                      placeholder="Enter option"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {field.type === "matrix" && (
                <div>
                  <label className="block font-semibold mb-2">SQD Questions (Rows)</label>
                  <p className="text-xs text-gray-500 mb-3">
                    Update each SQD 0-8 question text below. Names stay the same to keep analytics accurate.
                  </p>
                  <div className="space-y-3">
                    {(field.rows || []).map((row, idx) => (
                      <div key={row.name || idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                          {row.name || `Row ${idx + 1}`}
                        </div>
                        <input
                          type="text"
                          value={row.label || ""}
                          onChange={(e) => handleRowLabelChange(idx, e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Enter question text"
                        />
                      </div>
                    ))}
                    {(field.rows || []).length === 0 && (
                      <p className="text-sm text-gray-500">No rows defined for this matrix question.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-2">Required</label>
                <input
                  type="checkbox"
                  checked={field.required !== false}
                  onChange={(e) => onChange({ ...field, required: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Instruction <span className="text-gray-600 text-sm">(Optional)</span>
                </label>
                <textarea
                  value={field.instruction || ""}
                  onChange={(e) => onChange({ ...field, instruction: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                  placeholder="Add instruction text..."
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
