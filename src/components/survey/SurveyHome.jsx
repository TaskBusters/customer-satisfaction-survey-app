"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Logo from "../authentication/Logo"
import AboutCard from "./AboutCard"
import PrivacyPolicyModal from "./PrivacyPolicyModal"
import TermsModal from "./TermsModal"

const SurveyHome = ({ username = "Guest", onTakeSurvey, onAbout, onSettings, onExit, onLogin, onSignUp }) => {
  // Modal state
  const [showAbout, setShowAbout] = useState(false)
  const [showPolicy, setShowPolicy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const navigate = useNavigate()

  const handleAcceptPolicy = () => {
    setShowPolicy(false)
    setShowTerms(true)
  }

  const handleDeclinePolicy = () => {
    setShowPolicy(false)
  }

  const handleAcceptTerms = () => {
    setShowTerms(false)
    navigate("/surveyform")
  }

  const handleDeclineTerms = () => {
    setShowTerms(false)
    setShowPolicy(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#eaeaea]">
      <div className="flex flex-col flex-1 items-center justify-center px-4">
        <Logo className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-4" />
        <div className="text-center mb-7">
          <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl">Welcome to the</h2>
          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl">Customer Satisfaction Measurement Survey!</h2>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300
                        font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block
                        w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3"
            onClick={() => setShowPolicy(true)}
          >
            Take the Survey
          </button>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300
                        font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block
                        w-[90vw] max-w-xs sm:w-40 md:w-48 mb-3"
            onClick={() => setShowAbout(true)}
          >
            About
          </button>
        </div>
      </div>
      <AboutCard open={showAbout} onClose={() => setShowAbout(false)} />
      <PrivacyPolicyModal open={showPolicy} onAccept={handleAcceptPolicy} onDecline={handleDeclinePolicy} />
      <TermsModal open={showTerms} onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />
    </div>
  )
}

export default SurveyHome
