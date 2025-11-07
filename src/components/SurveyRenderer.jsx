  // SurveyRenderer.js
  import React from "react";
  import RadioField from "./RadioField";
  import TextField from "./TextField";
  import SelectField from "./SelectField";
  import TextAreaField from "./TextAreaField";
  import MatrixField from "./MatrixField";
  import { isFieldRequired } from "../survey/surveyUtils";

  export default function SurveyRenderer({ fields, answers, setAnswers }) {
    let prevSection = null;
    return (
      <>
        {fields.map((field, idx) => {
          const content = [];

          // Add divider and header if section changes
          if (field.section !== prevSection) {
            if (idx !== 0) {
              content.push(
                <hr
                  key={field.section + "-divider"}
                  className="my-8 border-gray-400 border-1"
                />
              );
            }
            content.push(
              <h3
                key={field.section + "-heading"}
                className="text-blue-700 font-bold text-2xl mb-5"
              >
                {field.section}
              </h3>
            );
            prevSection = field.section;
          }

          // Conditional logic (as before)
          if (field.conditionalRequired && !isFieldRequired(field, answers)) {
            return null;
          }

          // Render fields as before
          switch (field.type) {
            case "radio":
              if (field.name === "clientType") {
                content.push(
                  <RadioField
                    key={field.name}
                    label={field.label}
                    options={field.options}
                    value={answers[field.name]}
                    onChange={(val) =>
                      setAnswers((a) => ({ ...a, clientType: val }))
                    }
                    required={isFieldRequired(field, answers)}
                    name={field.name}
                    otherValue={answers.clientType_other || ""}
                    onOtherChange={(val) =>
                      setAnswers((a) => ({ ...a, clientType_other: val }))
                    }
                  />
                );
              } else {
                content.push(
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
              }
              break;
            case "text":
              content.push(
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
              break;
            case "select":
              content.push(
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
              break;
            case "textarea":
              content.push(
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
              break;
            case "matrix":
              content.push(
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
              break;
            default:
              break;
          }
          // Wrap everything for this field in a fragment with a key
          return (
            <React.Fragment key={field.name + "-wrapper"}>
              {content}
            </React.Fragment>
          );
        })}
      </>
    );
  }
