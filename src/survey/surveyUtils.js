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

export function isEmailValid(email) {
  if (!email) return false;

  const trimmed = email.trim();

  // Check for whitespace
  if (trimmed !== email) return false;

  // Valid email pattern
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailPattern.test(trimmed)) return false;

  const [localPart, domain] = trimmed.split("@");

  // Local part cannot be only numbers
  if (/^\d+$/.test(localPart)) return false;

  // Domain validation
  if (!domain || domain.includes("..")) return false;

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;
  if (
    domainParts.some(
      (part) => part.length === 0 || part.startsWith("-") || part.endsWith("-")
    )
  )
    return false;

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 24 || !/^[A-Za-z]{2,24}$/.test(tld))
    return false;

  // Block disposable/temp email domains
  const blockedDomains = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
    "fakeinbox.com",
    "sharklasers.com",
    "example.com",
    "test.com",
    "invalid.com",
  ];

  if (blockedDomains.some((d) => domain.toLowerCase().endsWith(d)))
    return false;

  return true;
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
