"use client";

export default function DeleteAdminModal({
  open,
  admin,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4 text-lg text-red-600">
          Delete Admin Account
        </h2>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the admin account for{" "}
          <strong>{admin?.fullName}</strong> ({admin?.email})?
        </p>
        <p className="text-sm text-red-500 mb-4">
          This action cannot be undone. All associated logs will remain for
          audit purposes.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold disabled:opacity-50"
            onClick={() => onConfirm(admin.email)}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
