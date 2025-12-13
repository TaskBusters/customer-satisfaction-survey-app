import { useEffect, useState } from "react";

// Define the full list of roles with categories for filtering
const allRoles = [
  { value: "superadmin", label: "System Administrator", category: "System" },
  { value: "surveyadmin", label: "Survey Administrator", category: "Survey" },
  { value: "analyst", label: "Analyst / Report Viewer", category: "Analytics" },
  {
    value: "support",
    label: "Support / Feedback Manager",
    category: "Support",
  },
];

export default function RoleEditModal({ open, user, onClose, onSave }) {
  const [newRole, setNewRole] = useState(user?.role || "");
  // State for the new filter dropdown
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    setNewRole(user?.role || "");
    // Reset filter when a new user is opened
    setFilterCategory("all");
  }, [user]);

  if (!open) return null;

  // Logic to filter the roles based on the selected category
  const filteredRoles = allRoles.filter((role) => {
    if (filterCategory === "all") return true;
    return role.category === filterCategory;
  });

  // Extract unique categories for the filter dropdown options
  const uniqueCategories = [...new Set(allRoles.map((role) => role.category))];

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4 text-lg">Change Admin Role</h2>
        <p className="text-sm text-gray-600 mb-2">Admin: {user?.fullName}</p>
        <p className="text-xs text-gray-500 mb-4">{user?.email}</p>

        {/* --- New Filter for Role Options --- */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-sm">
            Filter Role Options
          </label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              // Optional: Clear the newRole if the current one is no longer visible
              // setNewRole("");
            }}
          >
            <option value="all">Show All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category} Roles
              </option>
            ))}
          </select>
        </div>
        {/* ------------------------------------- */}

        <label className="block font-semibold mb-2 text-sm">
          Select New Role
        </label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          {/* Default option if the selected role is hidden by the filter */}
          {filteredRoles.length === 0 && (
            <option value="" disabled>
              No roles available for this filter
            </option>
          )}

          {/* Render the filtered roles */}
          {filteredRoles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => onSave(newRole)}
            disabled={!newRole} // Disable save if no role is selected/available
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
}
