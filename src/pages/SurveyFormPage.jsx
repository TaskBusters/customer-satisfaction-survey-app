import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SurveyRenderer from "../components/SurveyRenderer";
import Modal from "../components/Modal";
import ClearSurveyModal from "../components/ClearSurveyModal.jsx";
import ArrowButtonGroup from "../components/ArrowButtonGroup";
import fields from "../survey/surveyFields.js";
import {
  getMissingFields,
  isAgeValid,
  hasAnyAnswer,
} from "../survey/surveyUtils";

// Simple toast notification component
function ToastNotif({ show, color, children }) {
  if (!show) return null;
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className={`py-2 px-5 rounded shadow-xl font-semibold ${color}`}>
        {children}
      </div>
    </div>
  );
}

function getSubmittedAnswers(fields, answers) {
  return fields.reduce((result, field) => {
    if (field.conditional && field.conditional.showIf) {
      const showField = Object.entries(field.conditional.showIf).every(
        ([dep, vals]) => vals.includes(answers[dep])
      );
      if (!showField) return result;
    }
    result[field.name] = answers[field.name];
    return result;
  }, {});
}

export default function SurveyFormPage() {
  const [answers, setAnswers] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showClearSurveyModal, setShowClearSurveyModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white");
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome to show dialog
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingFields = getMissingFields(answers);

    let ageError = false;
    if (
      !missingFields.find((f) => f.name === "age") &&
      !isAgeValid(answers.age)
    ) {
      ageError = true;
    }

    if (missingFields.length > 0 || ageError) {
      setShowErrorModal(true);
      setToastMsg("Survey submission failed!");
      setToastColor("bg-red-600/90 text-white");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }

    // --- Simulated success for frontend only ---
    setToastMsg("Survey submitted successfully!");
    setToastColor("bg-green-500/90 text-white");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/aftersurvey");
    }, 1800);

    // Submit only if all required fields are valid
    const toSubmit = getSubmittedAnswers(fields, answers);
    // try {
    //   const res = await fetch("/api/survey", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(toSubmit),
    //   });
    //   if (res.ok) {
    //     setToastMsg("Survey submitted successfully!");
    //     setToastColor("bg-green-500/90 text-white");
    //     setShowToast(true);
    //     setTimeout(() => {
    //       setShowToast(false);
    //       navigate("/aftersurvey");
    //     }, 1800);
    //   } else {
    //     setToastMsg("Survey submission failed!");
    //     setToastColor("bg-red-600/90 text-white");
    //     setShowToast(true);
    //     setTimeout(() => setShowToast(false), 1800);
    //   }
    // } catch (err) {
    //   setToastMsg("Network error!");
    //   setToastColor("bg-red-600/90 text-white");
    //   setShowToast(true);
    //   setTimeout(() => setShowToast(false), 1800);
    // }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <ToastNotif show={showToast} color={toastColor}>
        {toastMsg}
      </ToastNotif>
      <ArrowButtonGroup />
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-8 shadow rounded-xl bg-white mt-10"
      >
        <h2 className="text-3xl text-blue-700 font-bold text-center mb-6">
          Client Satisfaction Survey
        </h2>
        <ClearSurveyModal
          open={showClearSurveyModal}
          onConfirm={() => {
            setAnswers({});
            setShowClearSurveyModal(false);
          }}
          onCancel={() => setShowClearSurveyModal(false)}
        />
        <SurveyRenderer
          fields={fields}
          answers={answers}
          setAnswers={setAnswers}
        />
        <div className="flex flex-row justify-between gap-4 mt-8">
          {hasAnyAnswer(answers) && (
            <button
              type="button"
              className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded px-5 py-2 transition"
              onClick={() => setShowClearSurveyModal(true)}
            >
              Clear Survey
            </button>
          )}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white rounded
                          px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base
                          ml-auto
                        "
          >
            Submit
          </button>
        </div>
      </form>
      {/* Modal here */}
      <Modal
        open={showErrorModal}
        title="Please answer all required fields"
        onClose={() => setShowErrorModal(false)}
      ></Modal>
    </div>
  );
}
