import "./App.css"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import RootLanding from "./pages/RootLanding"
import SurveyFormPage from "./pages/survey/SurveyFormPage"
import AfterSurveyPage from "./pages/survey/AfterSurveyPage"
import SubmissionsPage from "./pages/survey/SubmissionsPage"
import LoginPage from "./pages/authentication/LoginPage"
import RegisterPage from "./pages/authentication/RegisterPage"
import ForgotPassPage from "./pages/authentication/ForgotPassPage"
import ProtectedAdminRoute from "./pages/ProtectedAdminRoute"
import ProtectedRoute from "./pages/ProtectedRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminSurveysPage from "./pages/admin/AdminSurveysPage"
import AdminSurveyResponsesPage from "./pages/admin/AdminSurveyResponsesPage"
import AdminReportsPage from "./pages/admin/AdminReportsPage"
import AdminProfileSecurityPage from "./pages/admin/AdminProfileSecurityPage"
import AdminHelpFeedbackPage from "./pages/admin/AdminHelpFeedbackPage"
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage"
import { AuthProvider } from "./context/AuthContext"
import ScrollToTop from "./components/ScrollToTop"
import TitleManager from "./components/TitleManager"

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <TitleManager />

        <Routes>
          <Route path="/" element={<RootLanding />} />
          <Route path="/surveyform" element={<SurveyFormPage />} />
          <Route path="/survey/edit/:id" element={<SurveyFormPage />} />
          <Route path="/aftersurvey" element={<AfterSurveyPage />} />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <SubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassPage />} />

          {/* Admin Routes (protected) */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="overview" element={<AdminDashboard />} />
            <Route path="surveys" element={<AdminSurveysPage />} />
            <Route path="responses" element={<AdminSurveyResponsesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="profile" element={<AdminProfileSecurityPage />} />
            <Route path="help" element={<AdminHelpFeedbackPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
