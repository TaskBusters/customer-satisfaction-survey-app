import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SurveyPage from "./pages/survey/SurveyPage";
import SurveyFormPage from "./pages/survey/SurveyFormPage";
import AfterSurveyPage from "./pages/survey/AfterSurveyPage";
import SubmissionsPage from "./pages/survey/SubmissionsPage";
import LoginPage from "./pages/authentication/LoginPage";
import RegisterPage from "./pages/authentication/RegisterPage";
import ForgotPassPage from "./pages/authentication/ForgotPassPage";
import ProtectedAdminRoute from "./pages/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSurveysPage from "./pages/admin/AdminSurveysPage";
import AdminSurveyResponsesPage from "./pages/admin/AdminSurveyResponsesPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfileSecurityPage from "./pages/admin/AdminProfileSecurityPage";
import AdminHelpFeedbackPage from "./pages/admin/AdminHelpFeedbackPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import { AuthProvider } from "./context/AuthContext";

// 🛑 Import the new component
import ScrollToTop from "./components/ScrollToTop"; // Adjust the path as necessary

// ... all your other admin page imports ...

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 🛑 PLACEMENT: Add ScrollToTop here */}
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<SurveyPage />} />
          <Route path="/surveyform" element={<SurveyFormPage />} />
          <Route path="/survey/edit/:id" element={<SurveyFormPage />} />
          <Route path="/aftersurvey" element={<AfterSurveyPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />} />
          <Route path="/admin/overview" element={<AdminDashboard />} />
          <Route path="/admin/surveys" element={<AdminSurveysPage />} />
          <Route
            path="/admin/responses"
            element={<AdminSurveyResponsesPage />}
          />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/profile" element={<AdminProfileSecurityPage />} />
          <Route path="/admin/help" element={<AdminHelpFeedbackPage />} />
          <Route
            path="/admin/notifications"
            element={<AdminNotificationsPage />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
