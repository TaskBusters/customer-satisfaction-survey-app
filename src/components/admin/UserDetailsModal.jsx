import React, { useState, useEffect } from "react";

export default function UserDetailsModal({
  open,
  user,
  onClose,
  onSave,
  isEditing,
  setIsEditing,
  onDelete,
  mode = "view",
}) {
  const [editForm, setEditForm] = useState(user || {});

  useEffect(() => {
    setEditForm(user || {});
  }, [user, open]);

  if (!open || (!user && mode !== "add")) return null;

  const isAdd = mode === "add";
  const shouldDisableFields = !isEditing && !isAdd;

  const inputClass =
    "border border-gray-400 bg-white rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500 transition";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((curr) => ({ ...curr, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(editForm);
    if (!isAdd) setIsEditing(false);
  };

  const isAdmin = (editForm?.role || user?.role) === "Admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={editForm?.avatarUrl || ""}
            alt={editForm?.name || ""}
            className="w-14 h-14 rounded-full border"
          />
          <div>
            <div className="font-bold text-xl">
              {isAdd ? "Add User" : editForm?.name}
            </div>
            <div className="text-sm text-gray-500">{editForm?.email}</div>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Name</label>
            <input
              name="name"
              className={inputClass}
              value={editForm?.name || ""}
              onChange={handleChange}
              disabled={shouldDisableFields}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              className={inputClass}
              value={editForm?.email || ""}
              onChange={handleChange}
              disabled={shouldDisableFields}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Role</label>
            <input
              name="role"
              className={inputClass}
              value={editForm?.role || ""}
              onChange={handleChange}
              disabled={shouldDisableFields}
              required
            />
          </div>
          {isAdmin ? (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Office
                </label>
                <input
                  name="office"
                  className={inputClass}
                  value={editForm?.office || ""}
                  onChange={handleChange}
                  disabled={shouldDisableFields}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Department
                </label>
                <input
                  name="department"
                  className={inputClass}
                  value={editForm?.department || ""}
                  onChange={handleChange}
                  disabled={shouldDisableFields}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  District
                </label>
                <input
                  name="district"
                  className={inputClass}
                  value={editForm?.district || ""}
                  onChange={handleChange}
                  disabled={shouldDisableFields}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Barangay
                </label>
                <input
                  name="barangay"
                  className={inputClass}
                  value={editForm?.barangay || ""}
                  onChange={handleChange}
                  disabled={shouldDisableFields}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              name="status"
              className="border border-gray-400 bg-white rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500 transition"
              value={editForm?.status || "Active"}
              onChange={handleChange}
              disabled={shouldDisableFields}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Last Login
            </label>
            <input
              name="lastLogin"
              className={inputClass}
              value={editForm?.lastLogin || ""}
              onChange={handleChange}
              disabled={shouldDisableFields}
            />
          </div>
          <div className="flex gap-3 mt-6">
            {(isEditing || isAdd) && (
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                {isAdd ? "Add" : "Save"}
              </button>
            )}
            {!isAdd && isEditing && (
              <button
                type="button"
                className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded hover:bg-gray-300"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
            {!isAdd && !isEditing && (
              <>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition"
                  onClick={() => onDelete(editForm)}
                >
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              className="bg-gray-200 px-6 py-2 rounded font-semibold hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
