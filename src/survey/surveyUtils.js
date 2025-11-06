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

export function getMissingFields(answers) {
  return fields.filter(
    (field) =>
      isFieldRequired(field, answers) &&
      (field.type === "matrix"
        ? !answers[field.name] ||
          Object.keys(answers[field.name] || {}).length !== field.rows.length
        : !answers[field.name] || answers[field.name].toString().trim() === "")
  );
}

export function isAgeValid(age) {
  // Accept only numbers between 1 and 120 (or your preferred range)
  const ageNum = Number(age);
  return Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 120;
}
