import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import Papa from "papaparse";
import SearchBar from "../../components/admin/SearchBar";
import NotificationBar from "../../components/admin/NotificationBar";
import ReportChartCard from "../../components/admin/ReportChartCard";
import ExportButtons from "../../components/admin/ExportButtons";
import { Pie } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip, Legend);

const FAKE_REPORT_DATA = {
  labels: [
    "Strongly Agree",
    "Agree",
    "Neither Agree nor Disagree",
    "Disagree",
    "Strongly Disagree",
    "Not Applicable",
  ],
  values: [3, 3, 3, 3, 3, 4],
  numberOfRespondents: 19,
  date: "10/30/25",
};

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const chartRef = useRef();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setReportData(FAKE_REPORT_DATA);
      setLoading(false);
    }, 350);
  }, []);

  const chartDisplayData = reportData
    ? {
        labels: reportData.labels,
        datasets: [
          {
            data: reportData.values,
            backgroundColor: [
              "#9C27B0",
              "#FFEB3B",
              "#BDBDBD",
              "#03A9F4",
              "#FF9800",
              "#E0E0E0",
            ],
          },
        ],
      }
    : null;

  // PDF Export Handler
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Survey Report", 20, 20);
    doc.text(`No. of Respondents: ${reportData.numberOfRespondents}`, 20, 30);
    doc.text(`Date: ${reportData.date}`, 20, 40);
    const chartCanvas = chartRef.current?.canvas;
    if (chartCanvas) {
      const imgData = chartCanvas.toDataURL("image/png", 1.0);
      doc.addImage(imgData, "PNG", 20, 50, 100, 60);
    }
    doc.save("survey-report.pdf");
    setMessage("PDF export complete!");
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const data = reportData.labels.map((label, i) => ({
      Category: label,
      Value: reportData.values[i],
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    setMessage("CSV export complete!");
  };

  const handleClearMessage = () => setMessage("");

  // Filter chart data for search
  const filteredData =
    reportData && search
      ? {
          ...chartDisplayData,
          labels: reportData.labels.filter((label, i) =>
            label.toLowerCase().includes(search.toLowerCase())
          ),
          datasets: [
            {
              ...chartDisplayData.datasets[0],
              data: reportData.labels
                .map((label, i) =>
                  label.toLowerCase().includes(search.toLowerCase())
                    ? reportData.values[i]
                    : null
                )
                .filter((val) => val !== null),
              backgroundColor: reportData.labels
                .map((label, i) =>
                  label.toLowerCase().includes(search.toLowerCase())
                    ? chartDisplayData.datasets[0].backgroundColor[i]
                    : null
                )
                .filter((val) => val !== null),
            },
          ],
        }
      : chartDisplayData;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <NotificationBar message={message} onClear={handleClearMessage} />

        {/* Top: Reports Summary left, search bar right */}
        <div className="flex items-center justify-between mb-4 w-full">
          <div className="font-bold text-2xl">Reports Summary</div>
          <div className="w-full max-w-md flex justify-end">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or filter chart"
              className="max-w-md"
            />
          </div>
        </div>

        {/* Generate Report button below search, aligned right */}
        <div className="flex justify-end mb-8">
          <button
            className="border rounded px-5 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow transition"
            title="Generate new statistical PDF report"
            onClick={() => setMessage("Generate Report not implemented (demo)")}
          >
            Generate Report
          </button>
        </div>

        <ReportChartCard
          reportData={reportData}
          chartData={filteredData}
          chartRef={chartRef}
          loading={loading}
        />

        <ExportButtons
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />
      </main>
    </div>
  );
}
