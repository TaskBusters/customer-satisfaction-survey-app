import React, { useState, useEffect } from "react";

export default function AdminLogModal({ open, onClose, logs }) {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchAdmin, setSearchAdmin] = useState("");

  useEffect(() => {
    if (!searchAdmin.trim()) {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(
        (log) =>
          log.admin_name?.toLowerCase().includes(searchAdmin.toLowerCase()) ||
          log.admin_email?.toLowerCase().includes(searchAdmin.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchAdmin.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  }, [logs, searchAdmin]);

  if (!open) return null;

  return (
    <div className="fixed z-40 inset-0 bg-black/25 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl relative max-h-[90vh] overflow-hidden flex flex-col">
        <button className="absolute top-3 right-5 text-gray-400 hover:text-gray-600" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="font-bold mb-4 text-lg">Admin Activity Log</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by admin name, email, or action..."
            value={searchAdmin}
            onChange={(e) => setSearchAdmin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="text-sm">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 p-4">
                {logs.length === 0 ? "No logs available." : "No logs match your search."}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {log.admin_name || "System"}
                          <span className="text-xs text-gray-500 ml-2">({log.admin_email})</span>
                        </p>
                        <p className="text-gray-700 mt-1">{log.action}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(log.log_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>
    </div>
  );
}
