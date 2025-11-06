// SurveyRenderer.js
import React from "react";
import RadioField from "./RadioField";
import TextField from "./TextField";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import MatrixField from "./MatrixField";
import { isFieldRequired } from "../survey/surveyUtils";

export default function SurveyRenderer({ fields, answers, setAnswers }) {
  return (
    <>
      {fields.map((field) => {
        // Hide fields that should NOT be shown
        if (field.conditional && field.conditional.showIf) {
          const showField = Object.entries(field.conditional.showIf).every(
            ([dep, vals]) => vals.includes(answers[dep])
          );
          if (!showField) return null;
        }

        // Hide conditional required fields if not required
        if (field.conditionalRequired && !isFieldRequired(field, answers)) {
          return null;
        }

        switch (field.type) {
          case "radio":
            return (
              <RadioField
                key={field.name}
                label={field.label}
                options={field.options}
                value={answers[field.name]}
                onChange={(val) =>
                  setAnswers((a) => ({ ...a, [field.name]: val }))
                }
                required={isFieldRequired(field, answers)}
                name={field.name}
              />
            );
          case "text":
            return (
              <TextField
                key={field.name}
                label={field.label}
                value={answers[field.name]}
                placeholder={field.placeholder}
                onChange={(val) =>
                  setAnswers((a) => ({ ...a, [field.name]: val }))
                }
                required={isFieldRequired(field, answers)}
                name={field.name}
              />
            );
          case "select":
            return (
              <SelectField
                key={field.name}
                label={field.label}
                options={field.options}
                value={answers[field.name]}
                onChange={(val) =>
                  setAnswers((a) => ({ ...a, [field.name]: val }))
                }
                required={isFieldRequired(field, answers)}
              />
            );
          case "textarea":
            return (
              <TextAreaField
                key={field.name}
                label={field.label}
                value={answers[field.name]}
                placeholder={field.placeholder}
                onChange={(val) =>
                  setAnswers((a) => ({ ...a, [field.name]: val }))
                }
                required={isFieldRequired(field, answers)}
              />
            );
          case "matrix":
            // Pass answers as a single object for the matrix field
            return (
              <MatrixField
                key={field.name}
                label={field.label}
                rows={field.rows}
                columns={field.columns}
                value={answers[field.name] || {}}
                onChange={(matrixVal) =>
                  setAnswers((a) => ({ ...a, [field.name]: matrixVal }))
                }
                required={isFieldRequired(field, answers)}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
