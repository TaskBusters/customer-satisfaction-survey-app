import React from "react";

export default function UserCard({ user, onView, onEdit, onRemove }) {
  return (
    <div className="mb-4 last:mb-0 p-4 border rounded bg-gray-50 flex items-center justify-between hover:shadow">
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-10 h-10 rounded-full border"
        />
        <div>
          <div className="font-bold">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <span
            className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
              user.status === "Active"
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {user.status}
          </span>
          <span className="ml-2 inline-block text-xs px-2 py-1 rounded bg-gray-200 text-gray-500">
            {user.role}
          </span>
          <div className="text-xs text-gray-400 mt-1">
            Last login: {user.lastLogin}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
          onClick={() => onView(user)}
        >
          View
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
          onClick={() => onEdit(user)}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          onClick={() => onRemove(user)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
