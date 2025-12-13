"use client"

import Submissions from "../../components/survey/Submissions.jsx"
import Navbar from "../../components/survey/UserNavbar.jsx"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleHomeClick = () => {
    if (user) {
      navigate("/aftersurvey")
    } else {
      navigate("/")
    }
  }

  return (
    <>
      <Navbar onClickHome={handleHomeClick} />
      <Submissions />
    </>
  )
}
