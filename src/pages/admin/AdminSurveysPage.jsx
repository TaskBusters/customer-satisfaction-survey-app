import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AddSurveyQuestionModal from "../../components/admin/AddSurveyQuestionModal"
import EditSurveyQuestionModal from "../../components/admin/EditSurveyQuestionModal"
import ManageInstructionsModal from "../../components/admin/ManageInstructionsModal"
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
    if (!col.emoji && emojiMap[col.value]) {
      return {
        ...col,
        emoji: emojiMap[col.value],
      }
    }
    return col
  })
}

let cachedFields = null
let cacheTimestamp = null

export default function AdminSurveysPage() {
  const { user } = useAuth()
  const canEdit = canEditSurvey(user?.role)
  const [loading, setLoading] = useState(true)
  const [published, setPublished] = useState(false)
  const [instructions, setInstructions] = useState({})

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  const [editingField, setEditingField] = useState(null)
  const [surveys, setSurveys] = useState(fields)
  const [toastMsg, setToastMsg] = useState("")
  const [toastColor, setToastColor] = useState("")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // Load questions from database
    const loadFields = async () => {
      if (cachedFields && Date.now() - cacheTimestamp < 5 * 60 * 1000) {
        setSurveys(cachedFields)
        setLoading(false)
      } else {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/survey-questions`)
          const data = await res.json()

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
                is_required: q.is_required === true || q.is_required === 1 || q.is_required === "true",
                options: options || [],
                rows: rows || [],
                columns: restoredColumns,
                instruction: q.instruction || "",
              }
            })
            setSurveys(convertedFields)
            cachedFields = convertedFields
            cacheTimestamp = Date.now()
          } else {
            // If no questions in DB, save default fields
            saveFieldsToDatabase(fields)
            setSurveys(fields)
            cachedFields = fields
            cacheTimestamp = Date.now()
          }
        } catch (err) {
          console.error("Failed to load questions:", err)
          setSurveys(fields)
        }
      }

      try {
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`)
        const settings = await settingsRes.json()
        setPublished(settings.survey_published === "true")
      } catch (err) {
        console.error("Failed to load publish status:", err)
        setPublished(false)
      }

      setLoading(false)
    }

    loadFields()

    const handlePublishStatusChange = () => {
      const loadPublishStatus = async () => {
        try {
          const settingsRes = await fetch(`${API_BASE_URL}/api/settings`)
          const settings = await settingsRes.json()
          setPublished(settings.survey_published === "true")
        } catch (err) {
          console.error("Failed to load publish status:", err)
        }
      }
      loadPublishStatus()
    }

    window.addEventListener("publishStatusChanged", handlePublishStatusChange)
    return () => window.removeEventListener("publishStatusChanged", handlePublishStatusChange)
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
            is_required: field.is_required, // removed !== false conversion, pass value directly
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
    setEditingField({
      ...field,
      is_required: field.is_required !== false,
    })
    setShowEditModal(true)
  }

  const handleSaveField = async (fieldToSave) => {
    const field = fieldToSave || editingField

    // If no field available, show error
    if (!field || !field.name) {
      console.error("[v0] No field provided to handleSaveField")
      setToastMsg("Error: No field data")
      setToastColor("bg-red-600/90 text-white")
      setShowToast(true)
      return
    }

    try {
      const payload = {
        field_name: field.name,
        section: field.section,
        question_text: field.label,
        field_type: field.type,
        is_required: field.is_required,
        options: field.options || [],
        rows: field.rows || [],
        columns: field.columns || [],
        instruction: field.instruction || "",
      }

      console.log("[v0] handleSaveField payload:", payload)

      const response = await fetch(`${API_BASE_URL}/api/admin/survey-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log("[v0] Question saved successfully, reloading data...")
        const freshData = await fetch(`${API_BASE_URL}/api/admin/survey-questions`)
          .then((res) => res.json())
          .then((data) => {
            return data.map((q) => {
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

              let restoredColumns = columns || []
              if (q.field_type === "matrix" && restoredColumns.length > 0) {
                const emojiMap = {
                  1: "😡",
                  2: "😞",
                  3: "😐",
                  4: "😊",
                  5: "😄",
                  NA: "➖",
                }
                restoredColumns = restoredColumns.map((col) => {
                  if (!col.emoji && emojiMap[col.value]) {
                    return { ...col, emoji: emojiMap[col.value] }
                  }
                  return col
                })
              }

              return {
                section: q.section,
                name: q.field_name,
                type: q.field_type,
                label: q.question_text,
                is_required: q.is_required === true || q.is_required === 1 || q.is_required === "true",
                options: options || [],
                rows: rows || [],
                columns: restoredColumns,
                instruction: q.instruction || "",
              }
            })
          })

        setSurveys(freshData)
        cachedFields = freshData
        cacheTimestamp = Date.now()
        setEditingField(null)
        setShowEditModal(false)

        // Dispatch event so SurveyFormPage refetches
        window.dispatchEvent(new Event("surveyUpdated"))

        await logAdminAction(user.email, user.fullName, `Edited survey question: ${field.label}`)

        setToastMsg("Question saved successfully")
        setToastColor("bg-green-600/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 1800)
      } else {
        setToastMsg("Failed to save question")
        setToastColor("bg-red-600/90 text-white")
        setShowToast(true)
      }
    } catch (error) {
      console.error("[v0] Error saving field:", error)
      setToastMsg("Error saving question")
      setToastColor("bg-red-600/90 text-white")
      setShowToast(true)
    }
  }

  const handleAddField = async (field) => {
    try {
      const columnsWithEmojis =
        field.columns?.map((col) => ({
          ...col,
          emoji: col.emoji || "",
        })) || []

      const response = await fetch(`${API_BASE_URL}/api/admin/survey-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_name: field.name,
          section: field.section,
          question_text: field.label,
          field_type: field.type,
          is_required: field.required, // map required checkbox to is_required
          options: JSON.stringify(field.options || []),
          rows: JSON.stringify(field.rows || []),
          columns: JSON.stringify(columnsWithEmojis),
          instruction: field.instruction || "",
        }),
      })

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

          let restoredColumns = columns || []
          if (q.field_type === "matrix" && restoredColumns.length > 0) {
            restoredColumns = ensureEmojis(restoredColumns)
          }

          return {
            section: q.section,
            name: q.field_name,
            type: q.field_type,
            label: q.question_text,
            is_required: q.is_required === true || q.is_required === 1 || q.is_required === "true",
            options: options || [],
            rows: rows || [],
            columns: restoredColumns,
            instruction: q.instruction || "",
          }
        })
        setSurveys(convertedFields)
        cachedFields = convertedFields
        cacheTimestamp = Date.now()
      }

      setShowAddModal(false)

      await logAdminAction(user.email, user.fullName, `Added survey question: ${field.label}`)

      setToastMsg("Question added successfully!")
      setToastColor("bg-green-500/90 text-white")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)

      window.dispatchEvent(new Event("surveyUpdated"))
    } catch (err) {
      console.error("Failed to add question:", err)
      setToastMsg("Failed to add question")
      setToastColor("bg-red-600/90 text-white")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
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
        setToastMsg("Survey published successfully!")
        setToastColor("bg-green-500/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)

        window.dispatchEvent(new CustomEvent("reloadLogs"))
        window.dispatchEvent(new CustomEvent("publishStatusChanged"))
      } catch (err) {
        setToastMsg("Failed to publish survey!")
        setToastColor("bg-red-600/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
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
        setToastMsg("Survey unpublished.")
        setToastColor("bg-green-500/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)

        window.dispatchEvent(new CustomEvent("reloadLogs"))
        window.dispatchEvent(new CustomEvent("surveyUpdated"))
      } catch (err) {
        setToastMsg("Failed to unpublish survey!")
        setToastColor("bg-red-600/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
      }
    }
  }

  const handleDeleteField = async (fieldName) => {
    if (window.confirm("Delete this field?")) {
      console.log("[v0] Deleting field:", fieldName)
      try {
        await fetch(`${API_BASE_URL}/api/admin/survey-questions/${fieldName}`, {
          method: "DELETE",
        })
        setSurveys(surveys.filter((f) => f.name !== fieldName))
        cachedFields = null
        cacheTimestamp = null
        await logAdminAction(user.email, user.fullName, `Deleted survey question: ${fieldName}`)
        setToastMsg("Question deleted successfully!")
        setToastColor("bg-green-500/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)

        window.dispatchEvent(new CustomEvent("reloadLogs"))
        window.dispatchEvent(new CustomEvent("surveyUpdated"))
      } catch (err) {
        console.error("[v0] Delete error:", err)
        setToastMsg("Failed to delete question!")
        setToastColor("bg-red-600/90 text-white")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
      }
    }
  }

  const fieldsBySection = {}
  surveys.forEach((field) => {
    const section = field.section || "Other"
    if (!fieldsBySection[section]) {
      fieldsBySection[section] = []
    }
    fieldsBySection[section].push(field)
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
                onClick={() => setShowAddModal(true)}
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

          {/* Toast Message */}
          {showToast && (
            <div className={`mb-4 p-3 ${toastColor} border rounded-lg text-sm font-semibold`}>{toastMsg}</div>
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
                              {field.is_required && <span className="text-red-600 ml-2">*Required</span>}
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
                                  {field.is_required && <span className="text-red-600 ml-2">*Required</span>}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    // When editing a row, set the field for editing
                                    setEditingField({ ...field, editingRowIndex: rowIdx })
                                    setShowEditModal(true)
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
                                      handleSaveField(updatedField)
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
                              {field.is_required && <span className="text-red-600 ml-2">*Required</span>}
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

        {/* Add Modal */}
        {showAddModal && (
          <AddSurveyQuestionModal open={showAddModal} onSave={handleAddField} onCancel={() => setShowAddModal(false)} />
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <EditSurveyQuestionModal
            open={showEditModal}
            field={editingField}
            onSave={handleSaveField}
            onCancel={() => {
              setShowEditModal(false)
              setEditingField(null)
            }}
            onChange={setEditingField}
          />
        )}

        {/* Instructions Modal */}
        {showInstructionsModal && (
          <ManageInstructionsModal
            open={showInstructionsModal}
            existingInstructions={instructions}
            onSave={(category, instruction) => {
              handleSaveField({
                ...editingField,
                section: category,
                instruction: instruction,
              })
            }}
            onCancel={() => setShowInstructionsModal(false)}
          />
        )}
      </main>
    </div>
  )
}
