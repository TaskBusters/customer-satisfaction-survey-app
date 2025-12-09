"use client";
import Pagination from "../common/Pagination";

const getActionFilterLabel = (actionString) => {
  if (!actionString) return "UNKNOWN";
  return actionString.split(" ")[0].toUpperCase();
};

export default function AdminLogsTable({
  allLogs,
  loading,
  searchTerm,
  setSearchTerm,
  filterAction,
  setFilterAction,
  currentPage,
  setCurrentPage,
  logsPerPage = 10,
}) {
  const uniqueActionLabels = [
    ...new Set(allLogs.map((l) => getActionFilterLabel(l.action))),
  ].sort();

  const filteredLogs = allLogs.filter((l) => {
    const logActionLabel = getActionFilterLabel(l.action);

    const searchMatch =
      (l.admin_name || l.admin_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (l.action || "").toLowerCase().includes(searchTerm.toLowerCase());

    const actionMatch = filterAction === "" || logActionLabel === filterAction;

    return searchMatch && actionMatch;
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="font-semibold text-gray-900">Admin Activity Logs</p>
        <p className="text-sm text-gray-600 mt-1">
          Full detail log history of all admin activities ({filteredLogs.length}{" "}
          entries shown)
        </p>
      </div>

      <div className="p-4 border-b flex space-x-4">
        <input
          type="text"
          placeholder="Search admin name, email, or action..."
          className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 max-w-xs text-sm"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All Actions</option>
          {uniqueActionLabels.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <div>
            {/* Switched back to table-fixed for consistent column sizing */}
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  {/* Defined explicit percentage widths on <th>s */}
                  <th className="px-6 py-3 text-left font-semibold w-[20%]">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left font-semibold w-[20%]">
                    Admin Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold w-[30%]">
                    Admin Email
                  </th>
                  <th className="px-6 py-3 text-left font-semibold w-[30%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {allLogs.length === 0
                        ? "No admin activity logs found"
                        : "No logs found matching your filters/search."}
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      {/* Note: All <td>s no longer need whitespace-nowrap. Text will wrap. */}
                      <td className="px-6 py-3 text-gray-700 text-xs">
                        {new Date(log.log_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {log.admin_name || "—"}
                      </td>
                      {/* ✅ FIX 3: Keep break-all for long email strings to prevent overflow */}
                      <td className="px-6 py-3 text-gray-700 text-xs break-all">
                        {log.admin_email || "—"}
                      </td>
                      {/* ✅ FIX 3: Keep break-all for long action strings */}
                      <td className="px-6 py-3 text-gray-700 text-sm break-all">
                        {log.action || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-3 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
            showInfo={true}
          />
        </div>
      )}
    </div>
  );
}
