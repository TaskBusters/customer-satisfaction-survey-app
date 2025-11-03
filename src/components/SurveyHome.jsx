import React, { useState } from "react";
import { Button } from "flowbite-react";
import Logo from "./Logo";
import Navbar from "./Navbar";
import AboutCard from "./AboutCard";

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

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#eaeaea]">
      {/* Navbar at the top */}
      <Navbar
        username={username}
        onExit={onExit}
        onSettings={onSettings}
        onLogin={onLogin}
        onSignUp={onSignUp}
      />

      {/* Content below navbar */}
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
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:outline-black focus:ring-blue-300 
              font-medium rounded-lg text-sm px-5 py-2.5 text-center
              mx-auto block w-full sm:w-40 md:w-48"
            onClick={onTakeSurvey}
          >
            Take the Survey
          </button>
          <button
            type="submit"
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

      {/* About Modal */}
      <AboutCard open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default SurveyHome;
