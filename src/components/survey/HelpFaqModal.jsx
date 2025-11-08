// HelpFaqModal.jsx
import React from "react";
import Modal from "./UserModal"; // reuse your custom Modal

const faqList = [
  {
    q: "How do I take another survey?",
    a: "Click the 'Take Another Survey' button on this page and follow the instructions.",
  },
  {
    q: "Can I save my progress?",
    a: "At this time, survey responses cannot be saved as drafts. If you refresh or leave the page before submitting, your progress will not be preserved. Please ensure you complete and submit your survey in one session.",
  },
  {
    q: "Who sees my answers?",
    a: "Only authorized staff will access your responses, and they are kept confidential.",
  },
  // Add more question-answer pairs as needed
];

export default function HelpFaqModal({ open, onClose }) {
  return (
    <Modal open={open} title="Help &amp; FAQ" onClose={onClose}>
      <div className="p-4">
        {faqList.map((item, idx) => (
          <div key={idx} className="mb-4">
            <div className="font-semibold text-base">{item.q}</div>
            <div className="text-gray-700 mt-1">{item.a}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// Usage:
// const [showHelp, setShowHelp] = useState(false);
// <HelpFaqModal open={showHelp} onClose={() => setShowHelp(false)} />
