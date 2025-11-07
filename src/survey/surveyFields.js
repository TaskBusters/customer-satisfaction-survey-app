  import {
    FaAngry,
    FaFrown,
    FaMeh,
    FaSmile,
    FaLaugh,
    FaMinusCircle,
  } from "react-icons/fa";

  // ---- FIELD DEFINITIONS ----
  const fields = [
    // Personal Info
    {
      section: "Personal Info",
      name: "clientType",
      type: "radio",
      label: "Client Type",
      dataType: "string",
      required: true,
      options: [
        { value: "citizen", label: "Citizen" },
        { value: "business", label: "Business" },
        { value: "government", label: "Government" },
        { value: "others", label: "Others" },
      ],
    },
    {
      section: "Personal Info",
      name: "gender",
      type: "radio",
      label: "Gender",
      dataType: "string",
      required: true,
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "na", label: "Prefer not to say" },
      ],
    },
    {
      section: "Personal Info",
      name: "age",
      type: "text",
      label: "Age",
      dataType: "number",
      required: true,
      placeholder: "Enter age",
    },
    {
      section: "Personal Info",
      name: "region",
      type: "select",
      label: "Region of Residence",
      dataType: "string",
      required: true,
      options: [
        { value: "NCR", label: "National Capital Region (NCR)" },
        { value: "CAR", label: "Cordillera Administrative Region (CAR)" },
        // ... add other regions as needed
      ],
    },
    {
      section: "Personal Info",
      name: "service",
      type: "text",
      label: "Service Availed",
      dataType: "string",
      required: true,
      placeholder: "Enter service",
    },

    // Awareness
    {
      section: "Citizen's Charter Awareness",
      name: "ccAwareness",
      type: "radio",
      label: "Which best describes your awareness of a Citizen's Charter?",
      dataType: "number",
      required: true,
      options: [
        { value: 1, label: "I know what a CC is and I saw this office’s CC." },
        {
          value: 2,
          label: "I know what a CC is but I did NOT see this office’s CC.",
        },
        {
          value: 3,
          label: "I learned of the CC only when I saw this office’s CC.",
        },
        {
          value: 4,
          label: "I do not know what a CC is and did not see one in this office.",
        },
      ],
    },
    {
      section: "Citizen's Charter Awareness",
      name: "ccVisibility",
      type: "radio",
      label: "If aware of CC, would you say the CC of this office was...?",
      dataType: "number",
      required: true,
      options: [
        { value: 1, label: "Easy to see" },
        { value: 2, label: "Somewhat easy to see" },
        { value: 3, label: "Difficult to see" },
        { value: 4, label: "Not visible at all" },
        { value: 5, label: "Not Applicable" },
      ],
      conditionalRequired: {
        dependsOn: "ccAwareness", // reference dependency by name
        skipValues: [4], // list of values that mean this field is NOT required
      },
    },
    {
      section: "Citizen's Charter Awareness",
      name: "ccHelpfulness",
      type: "radio",
      label: "If aware of CC, how much did it help your transaction?",
      dataType: "number",
      required: true,
      options: [
        { value: 1, label: "Helped very much" },
        { value: 2, label: "Somewhat helped" },
        { value: 3, label: "Did not help" },
        { value: 4, label: "Not Applicable" },
      ],
      conditionalRequired: {
        dependsOn: "ccAwareness", // reference dependency by name
        skipValues: [4], // list of values that mean this field is NOT required
      },
    },

    // SQD matrix via "matrix" type
    {
      section: "Service Satisfaction",
      name: "sqdRatings",
      type: "matrix",
      label: "Rate Our Service Quality",
      dataType: "object",
      required: true,
      rows: [
        { name: "SQD0", label: "I am satisfied with the service I availed." },
        {
          name: "SQD1",
          label: "I spent a reasonable amount of time for my transaction.",
        },
        {
          name: "SQD2",
          label: "The office followed the transaction's requirements and steps.",
        },
        {
          name: "SQD3",
          label:
            "The steps I needed to do for my transaction were easy and simple.",
        },
        {
          name: "SQD4",
          label:
            "I easily found information about my transaction from the office or its website.",
        },
        {
          name: "SQD5",
          label:
            "I paid a reasonable amount of fees for my transaction. (If free, mark 'N/A')",
        },
        {
          name: "SQD6",
          label: "I feel the office was fair to everyone during my transaction.",
        },
        {
          name: "SQD7",
          label:
            "I was treated courteously by the staff; staff was helpful if asked.",
        },
        {
          name: "SQD8",
          label:
            "I got what I needed or (if denied) denial was sufficiently explained.",
        },
      ],
      columns: [
        {
          value: 1,
          label: "Strongly Disagree",
          icon: FaAngry,
          iconColor: "text-red-500",
        },
        {
          value: 2,
          label: "Disagree",
          icon: FaFrown,
          iconColor: "text-orange-500",
        },
        {
          value: 3,
          label: "Neither Agree nor Disagree",
          icon: FaMeh,
          iconColor: "text-yellow-500",
        },
        { value: 4, label: "Agree", icon: FaSmile, iconColor: "text-green-500" },
        {
          value: 5,
          label: "Strongly Agree",
          icon: FaLaugh,
          iconColor: "text-green-600",
        },
        {
          value: "NA",
          label: "Not Applicable",
          icon: FaMinusCircle,
          iconColor: "text-black",
        },
      ],
    },

    // Feedback
    {
      section: "Feedback",
      name: "suggestions",
      type: "textarea",
      label: "Suggestions for improvement (optional)",
      dataType: "string",
      required: false,
      placeholder: "Suggestions",
    },
    {
      section: "Feedback",
      name: "email",
      type: "text",
      label: "Email address (optional)",
      dataType: "string",
      required: false,
      placeholder: "Email",
    },
  ];

  export default fields;
