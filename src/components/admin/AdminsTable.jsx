"use client"
import Pagination from "../common/Pagination"

export default function AdminsTable({
  admins,
  loading,
  canEdit,
  isSuperAdmin,
  currentUser,
  adminSearch,
  setAdminSearch,
  adminPage,
  setAdminPage,
  adminsPerPage = 10,
  getRoleDescription,
  onEditRole,
  onDeleteAdmin,
}) {
  const safeAdmins = Array.isArray(admins) ? admins : []
  const filteredAdmins = safeAdmins.filter((a) =>
    `${a.fullName} ${a.email} ${a.role}`.toLowerCase().includes(adminSearch.toLowerCase()),
  )

  const adminTotalPages = Math.ceil(filteredAdmins.length / adminsPerPage)
  const adminIndexLast = adminPage * adminsPerPage
  const adminIndexFirst = adminIndexLast - adminsPerPage
  const currentAdmins = filteredAdmins.slice(adminIndexFirst, adminIndexLast)

  const paginateAdmins = (pageNumber) => setAdminPage(pageNumber)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="font-semibold text-gray-900">System Administrators</p>
        <p className="text-sm text-gray-600 mt-1">View admin accounts and manage roles (superadmin only)</p>
      </div>

      <div className="p-4 border-b flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search admin name, email, or role..."
          className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Showing {filteredAdmins.length} admin
          {filteredAdmins.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading admins...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Name</th>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Email</th>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Role</th>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Description</th>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {admins.length === 0 ? "No admin users found" : "No admins found matching your search."}
                  </td>
                </tr>
              ) : (
                currentAdmins.map((admin) => (
                  <tr key={admin.email} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">{admin.fullName}</td>
                    <td className="px-6 py-3 text-gray-700 text-xs whitespace-nowrap">{admin.email}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{getRoleDescription(admin.role)}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditRole(admin)}
                          disabled={!canEdit || currentUser.email === admin.email}
                          className={`px-3 py-1 text-sm border rounded transition ${
                            canEdit && currentUser.email !== admin.email
                              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Edit Role
                        </button>
                        {isSuperAdmin && currentUser.email !== admin.email && (
                          <button
                            onClick={() => onDeleteAdmin(admin)}
                            className="px-3 py-1 text-sm border border-red-200 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {adminTotalPages > 1 && (
        <div className="px-6 py-3 border-t">
          <Pagination
            currentPage={adminPage}
            totalPages={adminTotalPages}
            onPageChange={paginateAdmins}
            showInfo={true}
          />
        </div>
      )}
    </div>
  )
}
