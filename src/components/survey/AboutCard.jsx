import React from "react";

export default function AboutCard({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-3xl font-bold text-gray-400 hover:text-gray-700 focus:outline-none"
        >
          &times;
        </button>
        {/* Modal Content */}
        <>
          <h2 className="text-xl font-bold text-center mb-4">
            About This Survey
          </h2>
          <p className="mb-2 text-center">
            <b>The Client Satisfaction Measurement (CSM)</b> tracks the customer
            experience of government offices.
          </p>
          <p className="mb-2 text-center">
            Your feedback on your{" "}
            <span className="font-semibold">
              recently concluded transaction
            </span>{" "}
            will help this office provide a better service.
          </p>
          <p className="text-center">
            Personal information shared will be kept confidential, and you will
            always have the option not to answer this form.
          </p>
        </>
        {/* OK Button centered at the bottom, styled with Flowbite Tailwind CSS */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xl px-8 py-2 text-center"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
