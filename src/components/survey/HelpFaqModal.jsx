// HelpFaqModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "./UserModal";
import { API_BASE_URL } from "../../utils/api.js";

export default function HelpFaqModal({ open, onClose }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/faqs`)
        .then(res => res.json())
        .then(data => {
          setFaqs(data || []);
          setLoading(false);
        })
        .catch(() => {
          setFaqs([]);
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Modal open={open} title="Help &amp; FAQ" onClose={onClose}>
      <div className="p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center text-gray-500">No FAQs available at this time.</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="mb-4 pb-4 border-b last:border-b-0">
              {faq.category && (
                <span className="text-xs text-gray-500 uppercase">{faq.category}</span>
              )}
              <div className="font-semibold text-base mt-1">{faq.question}</div>
              <div className="text-gray-700 mt-1">{faq.answer}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

// Usage:
// const [showHelp, setShowHelp] = useState(false);
// <HelpFaqModal open={showHelp} onClose={() => setShowHelp(false)} />
