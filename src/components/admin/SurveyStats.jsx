// src/components/admin/SurveyStats.jsx

import React from "react";
import DashboardCard from "./DashboardCard";
import InfoRow from "./InfoRow";

/**
 * SurveyStats component
 * @param {object} stats - Stats object from backend: { surveys: {active, drafts, closed} }
 */
function SurveyStats({ stats }) {
  if (!stats || !stats.surveys) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
      <DashboardCard title="Surveys">
        <InfoRow label="Active" value={stats.surveys.active ?? "-"} />
        <InfoRow label="Drafts" value={stats.surveys.drafts ?? "-"} />
        <InfoRow label="Closed" value={stats.surveys.closed ?? "-"} />
      </DashboardCard>
      {/* Add more cards here if needed, using structure from backend */}
    </section>
  );
}

export default SurveyStats;
