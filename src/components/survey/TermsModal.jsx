import { useTranslation } from "react-i18next";

export default function TermsModal({ open, onAccept, onDecline }) {
  const { t } = useTranslation();

  if (!open) return null;

  const termsContent = [
    { title: "1. Acceptance of Terms", body: "By accessing or using the system, users agree to these Terms and Conditions. Continued use constitutes acceptance of all current and future revisions." },
    { title: "2. User Roles and Responsibilities", body: "The system operates under a role-based access structure:\n- System Administrator – Full access to settings, modules, accounts, and analytics.\n- Survey Administrator – Survey editing, response viewing, reporting, and feedback management.\n- Analyst – Read-only access to reports and analytics.\n- Support/Feedback Manager – Access to feedback and help resources.\n- Respondent – Access to the survey, help content, and feedback submission.\n\nUsers must use their role responsibly and adhere to established permissions." },
    { title: "3. Proper Use of the System", body: "Users agree not to:\n- Attempt unauthorized access to restricted modules\n- Modify, damage, or disrupt system operations\n- Submit false, harmful, or inappropriate information\n- Share confidential data without permission\n- Reverse engineer or replicate system components" },
    { title: "4. Data Consent", body: "By submitting a response, respondents consent to their information being processed in accordance with the Privacy Policy. Administrators agree to process data responsibly and securely." },
    { title: "5. Intellectual Property Rights", body: "All system content—design, survey structure, analytics, and documentation—is owned by the developing team or organization. Unauthorized copying, distribution, or commercial use is prohibited." },
    { title: "6. System Availability", body: "While efforts are made to maintain uptime, the system may be temporarily unavailable due to maintenance or technical issues. Developers are not liable for data loss or access disruption caused by external or uncontrolled factors." },
    { title: "7. Limitation of Liability", body: "The system developers are not responsible for:\n- Damages arising from misuse or negligence\n- Unauthorized access caused by user error\n- Losses resulting from downtime or interruptions\n\nUse of the system is at the user's own risk." },
    { title: "8. Account Suspension or Termination", body: "Accounts may be suspended or terminated for:\n- Policy violations\n- Security threats\n- Misuse or unauthorized access attempts\n\nSevere violations may result in immediate termination without notice." },
    { title: "9. Modification of Terms", body: "These Terms and Conditions may be modified at any time. Users will be informed of major updates through system notifications or official announcements." },
    { title: "10. Contact Information", body: "For inquiries regarding these Terms and Conditions, users may contact the designated system administrator through the Help & Feedback module." }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-2xl p-8 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Terms and Conditions</h2>
        <div className="border-2 border-gray-300 rounded-lg w-full px-6 py-4 mb-6 max-h-96 overflow-y-auto">
          {termsContent.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800">{section.title}</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            className="border-2 border-red-500 rounded-lg px-8 py-2 text-lg font-semibold hover:bg-red-50 text-red-600"
            onClick={onDecline}
          >
            {t("common.cancel")}
          </button>
          <button
            className="border-2 border-blue-500 bg-blue-500 rounded-lg px-8 py-2 text-lg font-semibold hover:bg-blue-600 text-white"
            onClick={onAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
