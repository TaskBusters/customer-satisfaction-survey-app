import fields from "./surveyFields";

export function isFieldRequired(field, answers) {
  if (!field.required) return false;
  if (field.conditionalRequired) {
    const dep = field.conditionalRequired.dependsOn;
    const skip = field.conditionalRequired.skipValues;
    if (answers && skip.includes(answers[dep])) return false;
  }
  return true;
}

// surveyUtils.js

export function getMissingFields(answers) {
  const baseMissing = fields.filter(
    (field) =>
      isFieldRequired(field, answers) &&
      (field.type === "matrix"
        ? !answers[field.name] ||
          Object.keys(answers[field.name] || {}).length !== field.rows.length
        : !answers[field.name] || answers[field.name].toString().trim() === "")
  );

  // --- ADD THIS CUSTOM CHECK AFTER YOUR BASE LOGIC ---
  // If clientType is "others", clientType_other must be filled out
  if (
    answers.clientType === "others" &&
    (!answers.clientType_other || answers.clientType_other.trim() === "")
  ) {
    baseMissing.push({ name: "clientType_other" });
  }

  return baseMissing;
}

export function isAgeValid(age) {
  // Accept only numbers between 1 and 120 (or your preferred range)
  const ageNum = Number(age);
  return Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 120;
}

export function hasAnyAnswer(answers) {
  return Object.values(answers).some((value) => {
    // Handles nested matrix objects, arrays, and strings
    if (value == null || value === "") return false;
    if (typeof value === "object")
      return Object.values(value).some((v) => v != null && v !== "");
    return true;
  });
}
