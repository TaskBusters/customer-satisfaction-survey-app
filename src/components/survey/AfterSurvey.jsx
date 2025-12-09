"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../authentication/Logo";
import HelpFaqModal from "./HelpFaqModal";
import { useAuth } from "../../context/AuthContext";

export default function AfterSurvey() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const { isGuest } = useAuth();

  // --- Non-scroll and Consistent Height Setup ---
  useEffect(() => {
    // 1a. Disable scrolling on the body
    document.body.style.overflow = "hidden";

    // 1b. Set the actual viewport height (vh) as a CSS variable for consistency
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);

    // Cleanup function to restore scrolling and remove listener when unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.removeProperty("--vh");
      window.removeEventListener("resize", setVh);
    };
  }, []);
  // ---------------------------------------------------

  const btnClass = `
    text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300
    font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block
    w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3`;

  const commonContainerClasses = "w-full flex flex-col bg-[#eaeaea]";
  const commonHeightStyle = { height: "calc(var(--vh, 1vh) * 100)" };

  return (
    <div className={commonContainerClasses} style={commonHeightStyle}>
      <div className="flex flex-col flex-1 items-center justify-center px-4 -mt-10">
        {/* ✅ Animated + Responsive Logo */}
        <Logo
          className="
            animate-logoPop
            w-40 h-40
            md:w-48 md:h-48
            lg:w-56 lg:h-56
            mb-4
          "
        />

        <div className="text-center mb-7">
          <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl">
            Thank you for taking the
          </h2>
          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl">
            Customer Satisfaction Measurement Survey!
          </h2>
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
