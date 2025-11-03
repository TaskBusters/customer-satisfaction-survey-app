import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SurveyForm from "../components/SurveyForm";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal"; // Import your modal

export default function SurveyFormPage() {
  const [showModal, setShowModal] = useState(true);

  // Optional: Show modal only on initial load
  // useEffect(() => setShowModal(true), []);

  const handleAccept = () => setShowModal(false);
  const handleDecline = () => setShowModal(false); // Or add custom logic

  return (
    <>
      <Navbar />
      <SurveyForm />
      <PrivacyPolicyModal
        open={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </>
  );
}
