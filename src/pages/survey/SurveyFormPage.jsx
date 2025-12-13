"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import Navbar from "../../components/survey/UserNavbar.jsx"
import SurveyRenderer from "../../components/survey/SurveyRenderer.jsx"
import UserInfoModal from "../../components/survey/UserInfoModal.jsx"
import ClearSurveyModal from "../../components/survey/ClearSurveyModal.jsx"
import ArrowButtonGroup from "../../components/survey/ArrowButtonGroup.jsx"
import fields from "../../survey/surveyFields.js"
import { isAgeValid } from "../../survey/surveyUtils.js"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../utils/api.js"
import { useTranslation } from "react-i18next"

let cachedFields = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function ToastNotif({ show, color, children }) {
  if (!show) return null
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className={`py-2 px-5 rounded shadow-xl font-semibold ${color}`}>{children}</div>
    </div>
  )
}

function getSubmittedAnswers(fields, answers) {
  return fields.reduce((result, field) => {
    if (field.conditional && field.conditional.showIf) {
      const showField = Object.entries(field.conditional.showIf).every(([dep, vals]) => vals.includes(answers[dep]))
      if (!showField) return result
    }
    result[field.name] = answers[field.name]
    return result
  }, {})
}

export default function SurveyFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const isEditMode = !!id
  const [answers, setAnswers] = useState({})
  const [userInfo, setUserInfo] = useState({ fullName: "", email: "" })
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showToast, setShowToast] = useState(false)
  const [showClearSurveyModal, setShowClearSurveyModal] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white")
  const [submitting, setSubmitting] = useState(false)
  const [surveyFields, setSurveyFields] = useState(fields)
  const [loadingFields, setLoadingFields] = useState(true)
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const { t } = useTranslation()

  // Load survey fields from database
  useEffect(() => {
    const handleSurveyUpdate = () => {
      console.log("[v0] Survey updated event received, clearing cache")
      cachedFields = null
      cacheTimestamp = null
      setLoadingFields(true)
    }

    window.addEventListener("surveyUpdated", handleSurveyUpdate)

    setLoadingFields(true)
    fetch(`${API_BASE_URL}/api/survey-questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
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

            // Restore emojis for matrix columns if missing
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

            return {
              section: q.section,
              name: q.field_name,
              type: q.field_type,
              label: q.question_text,
              required: q.is_required === true || q.is_required === 1 || q.is_required === "true",
              options: options || [],
              rows: rows || [],
              columns: restoredColumns,
              instruction: q.instruction || "",
              dataType: q.field_type === "number" ? "number" : "string",
            }
          })

          const sectionOrder = {
            "Personal Info": 1,
            "Citizen's Charter Awareness": 2,
            "Service Satisfaction": 3,
            Feedback: 4,
          }
          const fieldOrderMap = {
            "Personal Info": { clientType: 1, gender: 2, age: 3, region: 4, service: 5 },
          }
          const sortedFields = convertedFields.sort((a, b) => {
            const orderA = sectionOrder[a.section] || 99
            const orderB = sectionOrder[b.section] || 99

            if (orderA !== orderB) return orderA - orderB

            const order = fieldOrderMap[a.section]
            if (order) {
              const orderA = order[a.name] || 99
              const orderB = order[b.name] || 99
              if (orderA !== orderB) return orderA - orderB
            }

            // Within same section, sort by name for consistent order
            return (a.name || "").localeCompare(b.name || "")
          })

          cachedFields = sortedFields
          cacheTimestamp = Date.now()
          setSurveyFields(sortedFields)
        } else {
          setSurveyFields(fields)
        }
        setLoadingFields(false)
      })
      .catch(() => {
        setSurveyFields(fields)
        setLoadingFields(false)
      })

    return () => window.removeEventListener("surveyUpdated", handleSurveyUpdate)
  }, [])

  // Load submission data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const submission = location.state?.submission
      if (submission && submission.response_data) {
        const responseData =
          typeof submission.response_data === "string" ? JSON.parse(submission.response_data) : submission.response_data
        setAnswers(responseData)
        setUserInfo({ fullName: submission.user_name || "", email: submission.user_email || "" })
      } else if (id) {
        // Fetch submission if not in state
        fetch(`${API_BASE_URL}/api/submissions/detail/${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.response_data) {
              const responseData =
                typeof data.response_data === "string" ? JSON.parse(data.response_data) : data.response_data
              setAnswers(responseData)
              setUserInfo({ fullName: data.user_name || "", email: data.user_email || "" })
            }
          })
          .catch((err) => {
            console.error("Failed to load submission:", err)
            setToastMsg(t("survey.loadFailed"))
            setToastColor("bg-red-600/90 text-white")
            setShowToast(true)
            setTimeout(() => {
              setShowToast(false)
              navigate("/submissions")
            }, 2000)
          })
      }
    }
  }, [isEditMode, id, location.state])

  useEffect(() => {
    if (!isGuest) {
      setUserInfo({ fullName: user?.fullName || "", email: user?.email || "" })
    }
  }, [user, isGuest])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const handleUserInfoSubmit = (info) => {
    setUserInfo(info)
    setShowUserInfoModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newFieldErrors = {}

    // Validate all fields and collect all errors
    surveyFields.forEach((field) => {
      // Skip if field is not required
      if (!field.required) return

      // Handle conditional required fields
      if (
        field.conditionalRequired &&
        field.conditionalRequired.skipValues?.includes(answers[field.conditionalRequired.dependsOn])
      ) {
        return
      }

      // Validate matrix fields
      if (field.type === "matrix") {
        field.rows.forEach((row) => {
          const rowKey = `${field.name}.${row.name}`
          if (!answers[field.name] || !answers[field.name][row.name]) {
            newFieldErrors[rowKey] = t("survey.selectOption")
          }
        })
      } else if (!answers[field.name] || answers[field.name].toString().trim() === "") {
        // For radio, select, and matrix fields, use "selectOption" message
        if (field.type === "radio" || field.type === "select") {
          newFieldErrors[field.name] = t("survey.selectOption")
        }
        // For text and textarea fields, use "fillRequired" message
        else {
          newFieldErrors[field.name] = t("survey.fillRequired")
        }
      }
    })

    // Validate clientType_other when "others" is selected
    if (answers.clientType === "others" && (!answers.clientType_other || answers.clientType_other.trim() === "")) {
      newFieldErrors["clientType_other"] = t("survey.fillRequired")
    }

    // Validate age format
    if (answers.age && !isAgeValid(answers.age)) {
      newFieldErrors.age = t("survey.ageInvalid")
    }

    console.log("[v0] All validation errors collected:", newFieldErrors)

    // Set all errors at once for simultaneous display
    setFieldErrors(newFieldErrors)

    if (Object.keys(newFieldErrors).length > 0) {
      setToastMsg(t("survey.incompleteForm"))
      setToastColor("bg-red-600/90 text-white")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 1800)
      return
    }

    setSubmitting(true)
    setToastMsg(t("survey.submitting"))
    setToastColor("bg-blue-600/90 text-white")
    setShowToast(true)

    const toSubmit = getSubmittedAnswers(surveyFields, answers)

    try {
      let res
      if (isEditMode && id) {
        // Update existing submission
        res = await fetch(`${API_BASE_URL}/api/submissions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: user?.email || null,
            responses: toSubmit,
          }),
        })
      } else {
        // Create new submission
        res = await fetch(`${API_BASE_URL}/api/survey/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: user?.email || null,
            user_name: userInfo.fullName,
            responses: toSubmit,
          }),
        })
      }

      if (res.ok) {
        setToastMsg(isEditMode ? t("survey.updateSuccess") : t("survey.submitSuccess"))
        setToastColor("bg-green-500/90 text-white")
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          setSubmitting(false)
          navigate("/aftersurvey")
        }, 1800)
      } else {
        setToastMsg(isEditMode ? t("survey.updateFailed") : t("survey.submissionFailed"))
        setToastColor("bg-red-600/90 text-white")
        setShowToast(true)
        setSubmitting(false)
        setTimeout(() => setShowToast(false), 1800)
      }
    } catch (err) {
      console.error("[v0] Submission error:", err.message)
      setToastMsg(t("survey.networkError"))
      setToastColor("bg-red-600/90 text-white")
      setShowToast(true)
      setSubmitting(false)
      setTimeout(() => setShowToast(false), 1800)
    }
  }

  const handleClearSurvey = () => {
    setAnswers({})
    setFieldErrors({})
    setShowClearSurveyModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <ToastNotif show={showToast} color={toastColor}>
        {toastMsg}
      </ToastNotif>
      <ArrowButtonGroup />
      <Navbar homeOverride={!isGuest ? "/aftersurvey" : "/"} />
      <UserInfoModal open={showUserInfoModal} onSubmit={handleUserInfoSubmit} onCancel={() => navigate(-1)} />
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 shadow rounded-xl bg-white mt-10">
        <h2 className="text-3xl text-blue-700 font-bold text-center mb-6">
          {isEditMode ? t("survey.editSurvey") : t("survey.title")}
        </h2>
        <ClearSurveyModal
          open={showClearSurveyModal}
          onConfirm={handleClearSurvey}
          onCancel={() => setShowClearSurveyModal(false)}
        />
        <SurveyRenderer
          fields={surveyFields}
          answers={answers}
          setAnswers={setAnswers}
          disabled={submitting}
          fieldErrors={fieldErrors}
        />
        <div className="flex flex-row justify-between gap-4 mt-8">
          <button
            type="button"
            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded px-5 py-2 transition"
            onClick={() => setShowClearSurveyModal(true)}
            disabled={submitting}
          >
            {t("survey.clear")}
          </button>
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-700 text-white rounded
                      px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base ml-auto
                      ${submitting ? "opacity-60" : ""}`}
            disabled={submitting}
          >
            {submitting ? t("survey.submitting") : t("survey.submit")}
          </button>
        </div>
      </form>
    </div>
  )
}
