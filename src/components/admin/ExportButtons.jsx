import React from "react";

export default function ExportButtons({ onExportPDF, onExportCSV }) {
  return (
    <div className="flex flex-col md:flex-row justify-end gap-4">
      <button
        className="border rounded px-5 py-2 font-semibold bg-white hover:bg-gray-100 transition"
        title="Download report as PDF"
        onClick={onExportPDF}
      >
        Export Data as PDF
      </button>
      <button
        className="border rounded px-5 py-2 font-semibold bg-white hover:bg-gray-100 transition"
        title="Download report as CSV"
        onClick={onExportCSV}
      >
        Export Data as CSV
      </button>
    </div>
  );
}
