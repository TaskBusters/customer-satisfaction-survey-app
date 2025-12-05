"use client"

import { useTranslation } from "react-i18next"

export default function TermsModal({ open, onAccept, onDecline }) {
  const { t } = useTranslation()

  if (!open) return null

  const termsContent = [
    {
      title: t("termsAndConditions.section1Title"),
      body: t("termsAndConditions.section1Body"),
    },
    {
      title: t("termsAndConditions.section2Title"),
      body: t("termsAndConditions.section2Body"),
    },
    {
      title: t("termsAndConditions.section3Title"),
      body: t("termsAndConditions.section3Body"),
    },
    {
      title: t("termsAndConditions.section4Title"),
      body: t("termsAndConditions.section4Body"),
    },
    {
      title: t("termsAndConditions.section5Title"),
      body: t("termsAndConditions.section5Body"),
    },
    {
      title: t("termsAndConditions.section6Title"),
      body: t("termsAndConditions.section6Body"),
    },
    {
      title: t("termsAndConditions.section7Title"),
      body: t("termsAndConditions.section7Body"),
    },
    {
      title: t("termsAndConditions.section8Title"),
      body: t("termsAndConditions.section8Body"),
    },
    {
      title: t("termsAndConditions.section9Title"),
      body: t("termsAndConditions.section9Body"),
    },
    {
      title: t("termsAndConditions.section10Title"),
      body: t("termsAndConditions.section10Body"),
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-2xl p-8 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">{t("survey.termsAndConditions")}</h2>
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
            {t("survey.declineTerms")}
          </button>
          <button
            className="border-2 border-blue-500 bg-blue-500 rounded-lg px-8 py-2 text-lg font-semibold hover:bg-blue-600 text-white"
            onClick={onAccept}
          >
            {t("common.accept")}
          </button>
        </div>
      </div>
    </div>
  )
}
