import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../authentication/Logo";
import HelpFaqModal from "./HelpFaqModal";
import { useAuth } from "../../context/AuthContext";

export default function AfterSurvey() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const { isGuest } = useAuth();

  const btnClass = `
        text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300
        font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block
        w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3`;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#eaeaea]">
      <div className="flex flex-col flex-1 items-center justify-center">
        {/* ✅ Animated + Responsive Logo */}
        <Logo
          className="
            animate-logoPop
            w-40 h-40
            sm:w-36 sm:h-36
            md:w-32 md:h-32
            mb-4
          "
        />

        <div className="text-center mb-7">
          <h2 className="font-semibold text-xl">Thank you for taking the</h2>
          <h2 className="font-bold text-2xl">Customer Satisfaction Survey!</h2>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button className={btnClass} onClick={() => navigate("/surveyform")}>
            Take Another Survey
          </button>

          {!isGuest && (
            <button
              className={btnClass}
              onClick={() => navigate("/submissions")}
            >
              My Submissions
            </button>
          )}

          <button className={btnClass} onClick={() => setShowHelp(true)}>
            Help / FAQ
          </button>
        </div>
      </div>

      <HelpFaqModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
