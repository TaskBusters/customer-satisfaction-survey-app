import React from "react";
import { useTranslation } from "react-i18next";

export default function AboutCard({ open, onClose }) {
  const { t } = useTranslation();

  if (!open) return null;

  const aboutContent = `The system is a centralized survey management platform designed to support a single, fully editable survey. It provides administrators with an integrated environment for configuring survey content, managing responses, generating analytics, and reviewing user feedback. Built with role-based access control, the system ensures secure, structured, and efficient handling of survey data.

The platform aims to streamline the end-to-end survey workflow—from creation and response collection to reporting and analysis—while maintaining data integrity and compliance with privacy standards. Its modular design supports key administrative functions such as profile management, analytics generation, feedback review, and system configuration.

This system was developed to help organizations or academic institutions collect meaningful insights, ensure respondent confidentiality, and promote responsible digital data practices.`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-[90vw] max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          {t("common.about")}
        </h2>
        <div className="text-gray-700 space-y-4 text-sm leading-relaxed mb-6">
          {aboutContent.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="text-justify">{paragraph}</p>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-2 text-lg"
            onClick={onClose}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
