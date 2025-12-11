"use client"

// SurveyRenderer.js
import React from "react"
import RadioField from "./RadioField"
import TextField from "./TextField"
import SelectField from "./SelectField"
import TextAreaField from "./TextAreaField"
import MatrixField from "./MatrixField"
import { isFieldRequired } from "../../survey/surveyUtils"
import { useTranslation } from "react-i18next"

export default function SurveyRenderer({ fields, answers, setAnswers, disabled, fieldErrors = {} }) {
  const { t } = useTranslation()
  let prevSection = null

  const translateOption = (fieldName, optionValue, originalLabel) => {
    if (fieldName === "clientType") {
      if (optionValue === "citizen") return t("survey.citizen")
      if (optionValue === "business") return t("survey.business")
      if (optionValue === "government") return t("survey.government")
      if (optionValue === "others") return t("survey.others")
    }
    if (fieldName === "gender") {
      if (optionValue === "Male") return t("survey.male")
      if (optionValue === "Female") return t("survey.female")
      if (optionValue === "N/A") return "N/A"
    }
    if (fieldName === "ccAwareness") {
      if (optionValue === 1) return t("survey.cc1Option1")
      if (optionValue === 2) return t("survey.cc1Option2")
      if (optionValue === 3) return t("survey.cc1Option3")
      if (optionValue === 4) return t("survey.cc1Option4")
    }
    if (fieldName === "ccVisibility") {
      if (optionValue === 1) return t("survey.cc2Option1")
      if (optionValue === 2) return t("survey.cc2Option2")
      if (optionValue === 3) return t("survey.cc2Option3")
      if (optionValue === 4) return t("survey.cc2Option4")
      if (optionValue === 5) return t("survey.cc2Option5")
    }
    if (fieldName === "ccHelpfulness") {
      if (optionValue === 1) return t("survey.cc3Option1")
      if (optionValue === 2) return t("survey.cc3Option2")
      if (optionValue === 3) return t("survey.cc3Option3")
      if (optionValue === 4) return t("survey.cc3Option4")
    }
    return originalLabel
  }

  return (
    <>
      {fields.map((field, idx) => {
        const content = []

        // Add divider and header if section changes
        if (field.section !== prevSection) {
          if (idx !== 0) {
            content.push(<hr key={field.section + "-divider"} className="my-8 border-gray-400 border-1" />)
          }

          let sectionText = field.section
          if (field.section === "Personal Info") {
            sectionText = t("survey.personalInfo")
          } else if (field.section === "Citizen's Charter Awareness") {
            sectionText = t("survey.citizensCharterAwareness")
          } else if (field.section === "Service Satisfaction") {
            sectionText = t("survey.serviceQuality")
          } else if (field.section === "Feedback") {
            sectionText = t("survey.feedbackSection")
          }

          content.push(
            <h3 key={field.section + "-heading"} className="text-blue-700 font-bold text-2xl mb-2">
              {sectionText}
            </h3>,
          )

          if (field.instruction) {
            let instructionText = field.instruction
            if (field.section === "Citizen's Charter Awareness") {
              instructionText = t("survey.instructionsQA")
            } else if (field.section === "Service Satisfaction") {
              instructionText = t("survey.instructionsSQD")
            }
            content.push(
              <p key={field.section + "-instruction"} className="mb-6 text-sm text-gray-600">
                {instructionText}
              </p>,
            )
          }

          prevSection = field.section
        }

        // Conditional logic (as before)
        if (field.conditionalRequired && !isFieldRequired(field, answers)) {
          return null
        }

        let fieldLabel = field.label
        if (field.name === "clientType") {
          fieldLabel = t("survey.citizenType")
        } else if (field.name === "gender") {
          fieldLabel = t("survey.gender")
        } else if (field.name === "age") {
          fieldLabel = t("survey.ageLabel")
        } else if (field.name === "region") {
          fieldLabel = t("survey.regionLabel")
        } else if (field.name === "service") {
          fieldLabel = t("survey.serviceAvailedLabel")
        } else if (field.name === "ccAwareness") {
          fieldLabel = t("survey.ccAwarenessLabel")
        } else if (field.name === "ccVisibility") {
          fieldLabel = t("survey.ccVisibilityLabel")
        } else if (field.name === "ccHelpfulness") {
          fieldLabel = t("survey.ccHelpfulnessLabel")
        } else if (field.name === "sqdRatings") {
          fieldLabel = t("survey.serviceRatings")
        }

        // Render fields as before
        switch (field.type) {
          case "radio":
            const translatedOptions = field.options.map((opt) => ({
              ...opt,
              label: translateOption(field.name, opt.value, opt.label),
            }))

            if (field.name === "clientType") {
              content.push(
                <RadioField
                  key={field.name}
                  label={fieldLabel}
                  showRequired={isFieldRequired(field, answers)}
                  options={translatedOptions}
                  value={answers[field.name]}
                  onChange={(val) => setAnswers((a) => ({ ...a, clientType: val }))}
                  required={isFieldRequired(field, answers)}
                  name={field.name}
                  otherValue={answers.clientType_other || ""}
                  onOtherChange={(val) => setAnswers((a) => ({ ...a, clientType_other: val }))}
                  disabled={disabled}
                  error={fieldErrors[field.name]}
                />,
              )
            } else {
              content.push(
                <RadioField
                  key={field.name}
                  label={fieldLabel}
                  showRequired={isFieldRequired(field, answers)}
                  options={translatedOptions}
                  value={answers[field.name]}
                  onChange={(val) => setAnswers((a) => ({ ...a, [field.name]: val }))}
                  required={isFieldRequired(field, answers)}
                  name={field.name}
                  disabled={disabled}
                  error={fieldErrors[field.name]}
                />,
              )
            }
            break
          case "text":
            content.push(
              <TextField
                key={field.name}
                label={fieldLabel}
                showRequired={isFieldRequired(field, answers)}
                value={answers[field.name]}
                placeholder={field.placeholder}
                onChange={(val) => setAnswers((a) => ({ ...a, [field.name]: val }))}
                required={isFieldRequired(field, answers)}
                name={field.name}
                disabled={disabled}
                error={fieldErrors[field.name]}
                maxLength={field.name === "age" ? 3 : 255}
              />,
            )
            break
          case "select":
            content.push(
              <SelectField
                key={field.name}
                label={fieldLabel}
                showRequired={isFieldRequired(field, answers)}
                options={field.options}
                value={answers[field.name]}
                onChange={(val) => setAnswers((a) => ({ ...a, [field.name]: val }))}
                required={isFieldRequired(field, answers)}
                disabled={disabled}
                error={fieldErrors[field.name]}
              />,
            )
            break
          case "textarea":
            const fieldRequired =
              field.required &&
              (!field.conditionalRequired ||
                !field.conditionalRequired.skipValues?.includes(answers[field.conditionalRequired.dependsOn]))

            let labelText = fieldLabel
            let placeholderText = field.placeholder
            let maxChars = 500

            if (field.name === "suggestions") {
              labelText = t("survey.suggestionsLabel")
              placeholderText = t("survey.suggestionsPlaceholder")
              maxChars = 500
            } else if (field.name === "email") {
              labelText = t("survey.emailAddressLabel")
              placeholderText = t("survey.emailPlaceholder")
              maxChars = 255
            }

            content.push(
              <TextAreaField
                key={field.name}
                label={labelText}
                showRequired={fieldRequired}
                value={answers[field.name]}
                placeholder={placeholderText}
                onChange={(val) => setAnswers((a) => ({ ...a, [field.name]: val }))}
                required={fieldRequired}
                disabled={disabled}
                error={fieldErrors[field.name]}
                maxLength={maxChars}
              />,
            )
            break
          case "matrix":
            const translatedColumns = field.columns.map((col) => {
              let translatedLabel = col.label
              if (col.value === 1) translatedLabel = t("survey.stronglyDisagree")
              if (col.value === 2) translatedLabel = t("survey.disagree")
              if (col.value === 3) translatedLabel = t("survey.neitherAgreeNorDisagree")
              if (col.value === 4) translatedLabel = t("survey.agree")
              if (col.value === 5) translatedLabel = t("survey.stronglyAgree")
              if (col.value === "N/A") translatedLabel = t("survey.notApplicable")
              return { ...col, label: translatedLabel }
            })

            const translatedRows = field.rows.map((row) => ({
              ...row,
              label: t(`survey.${row.name.toLowerCase()}`) || row.label,
            }))

            content.push(
              <MatrixField
                key={field.name}
                label={fieldLabel}
                showRequired={isFieldRequired(field, answers)}
                rows={translatedRows}
                columns={translatedColumns}
                value={answers[field.name] || {}}
                onChange={(matrixVal) => setAnswers((a) => ({ ...a, [field.name]: matrixVal }))}
                required={isFieldRequired(field, answers)}
                disabled={disabled}
                fieldErrors={fieldErrors}
                field={field}
                answers={answers}
              />,
            )
            break
          default:
            break
        }
        // Wrap everything for this field in a fragment with a key
        return <React.Fragment key={field.name + "-wrapper"}>{content}</React.Fragment>
      })}
    </>
  )
}
