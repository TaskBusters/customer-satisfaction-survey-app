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
  const disabled = !isEditing && !isAdd;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(editForm);
    if (!isAdd) setIsEditing(false);
  };

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
              className="border rounded px-3 py-2 w-full"
              value={editForm?.name || ""}
              onChange={handleChange}
              disabled={disabled && !isAdd}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="border rounded px-3 py-2 w-full"
              value={editForm?.email || ""}
              onChange={handleChange}
              disabled={disabled && !isAdd}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Role</label>
            <input
              name="role"
              className="border rounded px-3 py-2 w-full"
              value={editForm?.role || ""}
              onChange={handleChange}
              disabled={disabled && !isAdd}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              name="status"
              className="border rounded px-3 py-2 w-full"
              value={editForm?.status || "Active"}
              onChange={handleChange}
              disabled={disabled && !isAdd}
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
              className="border rounded px-3 py-2 w-full"
              value={editForm?.lastLogin || ""}
              onChange={handleChange}
              disabled={disabled && !isAdd}
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
