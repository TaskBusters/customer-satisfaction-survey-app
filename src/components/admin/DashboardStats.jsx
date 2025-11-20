import React from "react";
import DashboardCard from "./DashboardCard";
import InfoRow from "./InfoRow";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

function DashboardStats({ loading, stats, onShowLogs, search }) {
  if (loading) {
    return <div className="text-center text-gray-500 py-20">Loading...</div>;
  }
  if (!stats) return null;

  const reportChartData =
    stats.reports && stats.reports.chartData
      ? {
        labels: stats.reports.chartData.map((d) => d.label),
        datasets: [
          {
            data: stats.reports.chartData.map((d) => d.value),
            backgroundColor: stats.reports.chartData.map((d) => d.color),
          },
        ],
      }
      : null;

  const cards = [
    {
      title: "Surveys",
      content: (
        <>
          <InfoRow label="Active" value={stats.surveys.active} />
          <InfoRow label="Drafts" value={stats.surveys.drafts} />
          <InfoRow label="Closed" value={stats.surveys.closed} />
        </>
      ),
    },
    {
      title: "Responses",
      content: (
        <>
          <InfoRow label="Registered" value={stats.responses.registered} />
          <InfoRow label="Guest" value={stats.responses.guest} />
        </>
      ),
    },
    {
      title: "Profile & Security",
      content: (
        <>
          <InfoRow label="Active Users" value={stats.profile.activeUsers} />
          <InfoRow label="User Count" value={stats.profile.userCount} />
          <InfoRow
            label="Registered Respondents"
            value={stats.profile.respondents}
          />
          <button
            className="mt-3 text-sm px-4 py-1.5 border font-semibold rounded hover:bg-gray-100 transition"
            onClick={onShowLogs}
          >
            View Logs
          </button>
        </>
      ),
    },
    {
      title: "Reports",
      content: (
        <>
          <InfoRow label="Submitted" value={stats.reports.submitted} />
          <InfoRow label="Drafts" value={stats.reports.drafts} />
          {reportChartData && (
            <div className="my-3 w-32 h-32 mx-auto">
              <Pie
                data={reportChartData}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  responsive: true,
                }}
              />
            </div>
          )}
        </>
      ),
    },
  ];

  const filteredCards = search
    ? cards.filter((card) =>
        card.title.toLowerCase().includes(search.toLowerCase())
      )
    : cards;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
      {filteredCards.map((card) => (
        <DashboardCard title={card.title} key={card.title}>
          {card.content}
        </DashboardCard>
      ))}
    </section>
  );
}

export default DashboardStats;
