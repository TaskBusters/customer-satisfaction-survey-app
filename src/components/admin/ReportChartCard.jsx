import React from "react";
import { Pie } from "react-chartjs-2";

// chartRef should be created with useRef and passed as prop
export default function ReportChartCard({
  reportData,
  chartData,
  chartRef,
  loading,
}) {
  return (
    <div className="border p-8 rounded bg-white shadow mb-6 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
      <div className="w-full text-lg font-semibold mb-4 flex items-center justify-between">
        <span>Survey Report</span>
        <span className="text-gray-500 text-sm">
          Responses: {reportData?.numberOfRespondents || "-"}
        </span>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[25rem] text-gray-400 text-center text-xl">
          Loading chart...
        </div>
      ) : reportData ? (
        <div className="flex flex-col md:flex-row gap-10 items-center w-full">
          <div className="w-[20rem] h-[20rem] min-w-[16rem] min-h-[16rem] flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg shadow">
            <Pie
              data={chartData}
              ref={chartRef}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "right" },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex-1 min-w-[13rem]">
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Date:</span>
              <span className="ml-2 font-bold">{reportData?.date}</span>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.labels.map((label, i) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className="inline-block w-4 h-4 mr-1 rounded-full border"
                    style={{
                      background:
                        chartData.datasets[0].backgroundColor[i] || "#333",
                    }}
                  />
                  <span className="font-medium">{label}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {chartData.datasets[0].data[i]} votes
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[20rem] text-gray-400 text-center text-xl">
          No report data found.
        </div>
      )}
    </div>
  );
}
