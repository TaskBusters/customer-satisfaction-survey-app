import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import Logo from "./Logo";
import Navbar from "./Navbar";
import AboutCard from "./AboutCard";
import SurveyForm from "./SurveyForm";

const SurveyHome = ({
  username = "Guest",
  onTakeSurvey,
  onAbout,
  onSettings,
  onExit,
  onLogin,
  onSignUp,
}) => {
  // Modal state
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate(); // <-- Add this line

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#eaeaea]">
      <div className="flex flex-col flex-1 items-center justify-center">
        <Logo className="w-32 h-32 mb-4" />
        <div className="text-center mb-7">
          <h2 className="font-semibold text-xl">Welcome to the</h2>
          <h2 className="font-bold text-2xl">
            Customer Satisfaction Measurement Survey!
          </h2>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:outline-black focus:ring-blue-300 
              font-medium rounded-lg text-sm px-5 py-2.5 text-center
              mx-auto block w-full sm:w-40 md:w-48"
            onClick={() => navigate("/surveyform")}
          >
            Take the Survey
          </button>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:outline-black focus:ring-blue-300 
              font-medium rounded-lg text-sm px-5 py-2.5 text-center
              mx-auto block sm:w-40 md:w-48 w-full"
            onClick={() => setShowAbout(true)}
          >
            About
          </button>
        </div>
      </div>
      <AboutCard open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default SurveyHome;
