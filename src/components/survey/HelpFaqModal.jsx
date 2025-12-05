"use client"

import { useState, useEffect } from "react"
import Modal from "./UserModal"
import { API_BASE_URL } from "../../utils/api.js"
import { useTranslation } from "react-i18next"

export default function HelpFaqModal({ open, onClose }) {
  const { t } = useTranslation()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  const defaultFAQs = [
    {
      id: 1,
      category: "General",
      question: "What is this survey about?",
      answer:
        "This is a Customer Satisfaction Survey designed to gather feedback about services and identify areas for improvement.",
    },
    {
      id: 2,
      category: "General",
      question: "How long does the survey take?",
      answer: "The survey typically takes 5-10 minutes to complete, depending on your answers.",
    },
    {
      id: 3,
      category: "Privacy",
      question: "Is my data kept confidential?",
      answer:
        "Yes, all survey responses are kept confidential and used only for aggregated analysis. Personal information is protected according to our Privacy Policy.",
    },
    {
      id: 4,
      category: "Privacy",
      question: "Will my response be identified?",
      answer:
        "Survey responses are anonymous unless you choose to provide contact information. Providing your name or email is optional.",
    },
    {
      id: 5,
      category: "Technical",
      question: "What should I do if I encounter an error?",
      answer:
        "If you experience technical issues, please refresh the page and try again. If the problem persists, contact the system administrator.",
    },
  ]

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/faqs`)
        .then((res) => res.json())
        .then((data) => {
          setFaqs(data && data.length > 0 ? data : defaultFAQs)
          setLoading(false)
        })
        .catch(() => {
          setFaqs(defaultFAQs)
          setLoading(false)
        })
    }
  }, [open])

  return (
    <Modal open={open} title={t("survey.helpAndFAQ")} onClose={onClose}>
      <div className="p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">{t("common.loading") || "Loading FAQs..."}</div>
        ) : faqs.length === 0 ? (
          <div className="text-center text-gray-500">{t("common.noFAQ") || "No FAQs available at this time."}</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="mb-4 pb-4 border-b last:border-b-0">
              {faq.category && <span className="text-xs text-gray-500 uppercase font-semibold">{faq.category}</span>}
              <div className="font-semibold text-base mt-1">{faq.question}</div>
              <div className="text-gray-700 mt-1 text-sm">{faq.answer}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
