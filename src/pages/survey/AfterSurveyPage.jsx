import AfterSurvey from "../../components/survey/AfterSurvey.jsx"
import Navbar from "../../components/survey/UserNavbar.jsx"

export default function AfterSurveyPage() {
  return (
    <>
      <Navbar onClickHome={() => (window.location.pathname = "/aftersurvey")} />
      <AfterSurvey />
    </>
  )
}
