import { useTranslation } from "react-i18next";

export default function PrivacyPolicyModal({ open, onAccept, onDecline }) {
  const { t } = useTranslation();

  if (!open) return null;

  const privacyContent = [
    { title: "1. Introduction", body: "This Privacy Policy explains how the system collects, uses, stores, and protects the information of all users and survey respondents. We are committed to maintaining confidentiality, transparency, and compliance with data protection principles." },
    { title: "2. Information We Collect", body: "Respondents: Name, email address (if required), demographic details, consent records, survey responses, and feedback.\n\nAdministrators: Name, email, login credentials, profile details, role designation, activity logs.\n\nSystem Data: Response timestamps, analytics, system logs, device information for security purposes." },
    { title: "3. Purpose of Data Collection", body: "Collected data is used solely for:\n- Survey administration and analytics\n- Enhancing user experience and providing support\n- Maintaining system security, audit trails, and account integrity\n- Generating reports and organizational insights\n\nWe do not use collected information for marketing or commercial distribution." },
    { title: "4. Data Storage and Security", body: "All data is encrypted and managed under strict role-based access controls. Administrative accounts follow strong password policies, and two-factor authentication may be implemented. Regular backups and audit logs protect against data loss and unauthorized access." },
    { title: "5. Data Retention", body: "Survey responses and user information are retained only for the duration necessary to fulfill system functions. Administrators may configure retention durations in system settings. When data is deleted or expired, it is permanently removed from the database." },
    { title: "6. Data Sharing and Disclosure", body: "Information will not be sold or shared outside the organization except when required by law or when authorized by the administrator for institutional analysis. Respondent identities remain confidential and are protected from unauthorized disclosure." },
    { title: "7. User Rights", body: "Users may:\n- Request access to their data\n- Request corrections or deletion\n- Withdraw consent\n- Contact the system administrator for clarification or concerns" },
    { title: "8. Updates to this Policy", body: "This Privacy Policy may be updated due to system improvements or compliance requirements. Users will be notified of major changes." }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-2xl p-8 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Privacy Policy</h2>
        <div className="border-2 border-gray-300 rounded-lg w-full px-6 py-4 mb-6 max-h-96 overflow-y-auto">
          {privacyContent.map((section, idx) => (
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
