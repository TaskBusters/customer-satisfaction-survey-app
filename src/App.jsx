import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SurveyPage from "./pages/SurveyPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassPage from "./pages/ForgotPassPage";
import SurveyFormPage from "./pages/SurveyFormPage";
import AfterSurveyPage from "./pages/AfterSurveyPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SurveyPage />} />
          <Route path="/surveyform" element={<SurveyFormPage />} />
          <Route path="/aftersurvey" element={<AfterSurveyPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
