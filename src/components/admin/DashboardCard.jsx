function DashboardCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border px-5 py-4 flex flex-col shadow min-h-[170px]">
      <div className="font-semibold border-b text-base pb-1 mb-2">{title}</div>
      {children}
    </div>
  );
}

export default DashboardCard;
