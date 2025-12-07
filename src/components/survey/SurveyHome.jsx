"use client";

import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import Logo from "../authentication/Logo";

import AboutCard from "./AboutCard";

import PrivacyPolicyModal from "./PrivacyPolicyModal";

import TermsModal from "./TermsModal";

import { API_BASE_URL } from "../../utils/api.js";

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

  const [showPolicy, setShowPolicy] = useState(false);

  const [showTerms, setShowTerms] = useState(false);

  const [isPublished, setIsPublished] = useState(true);

  const [loadingStatus, setLoadingStatus] = useState(true);

  const navigate = useNavigate();

  const { t } = useTranslation();

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

  useEffect(() => {
    const fetchPublishStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);

        const settings = await res.json();

        setIsPublished(settings.survey_published === "true");
      } catch (err) {
        console.error("Failed to fetch publish status:", err);

        setIsPublished(true); // Default to published if fetch fails
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchPublishStatus();

    const handlePublishStatusChange = () => {
      fetchPublishStatus();
    };

    window.addEventListener("publishStatusChanged", handlePublishStatusChange);

    return () =>
      window.removeEventListener(
        "publishStatusChanged",

        handlePublishStatusChange
      );
  }, []);

  const handleAcceptPolicy = () => {
    setShowPolicy(false);

    setShowTerms(true);
  };

  const handleDeclinePolicy = () => {
    setShowPolicy(false);
  };

  const handleAcceptTerms = () => {
    setShowTerms(false);

    navigate("/surveyform");
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);

    setShowPolicy(false);
  };

  const commonContainerClasses = "w-full flex flex-col bg-[#eaeaea]";

  const commonHeightStyle = { height: "calc(var(--vh, 1vh) * 100)" };

  if (loadingStatus) {
    return (
      <div className={commonContainerClasses} style={commonHeightStyle}>
        <div className="flex flex-col flex-1 items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className={commonContainerClasses} style={commonHeightStyle}>
        <div className="flex flex-col flex-1 items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-4xl mb-4">🔧</div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Survey Under Maintenance
            </h2>

            <p className="text-gray-600 mb-2">
              We're currently updating the survey.
            </p>

            <p className="text-gray-600">Please check back soon.</p>

            <button
              onClick={() => {
                setLoadingStatus(true);

                setTimeout(() => {
                  fetch(`${API_BASE_URL}/api/settings`)
                    .then((res) => res.json())

                    .then((settings) => {
                      setIsPublished(settings.survey_published === "true");

                      setLoadingStatus(false);
                    })

                    .catch(() => setLoadingStatus(false));
                }, 1000);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={commonContainerClasses} style={commonHeightStyle}>
      {/* 🛑 CORE FIX: Re-added 'flex-1' and 'justify-center', and added a negative top margin ('-mt-10') to pull the centered block up. */}

      <div className="flex flex-col flex-1 items-center justify-center px-4 -mt-10">
        <Logo className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-4" />

        <div className="text-center mb-7">
          <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl">
            Welcome to the
          </h2>

          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl">
            Customer Satisfaction Measurement Survey!
          </h2>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300

                       font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block

                       w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3"
            onClick={() => setShowPolicy(true)}
          >
            {t("survey.takeSurvey")}
          </button>

          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300

                       font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block

                       w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3"
            onClick={() => setShowAbout(true)}
          >
            {t("survey.about")}
          </button>
        </div>
      </div>

      <AboutCard open={showAbout} onClose={() => setShowAbout(false)} />

      <PrivacyPolicyModal
        open={showPolicy}
        onAccept={handleAcceptPolicy}
        onDecline={handleDeclinePolicy}
      />

      <TermsModal
        open={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </div>
  );
};

export default SurveyHome;
