import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SearchBar from "../../components/admin/SearchBar";
import UserCard from "../../components/admin/UserCard";
import NotificationBar from "../../components/admin/NotificationBar";
import UserDetailsModal from "../../components/admin/UserDetailsModal";

// Enhanced demo user data (showing avatars, roles, etc.)
const FAKE_USERS = [
  {
    name: "User 1",
    email: "user1@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=3",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-11-05 14:29",
  },
  {
    name: "User 2",
    email: "user2@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=5",
    role: "Editor",
    status: "Active",
    lastLogin: "2025-11-07 09:12",
  },
  {
    name: "User 3",
    email: "user3@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=6",
    role: "Viewer",
    status: "Suspended",
    lastLogin: "2025-11-02 18:00",
  },
  {
    name: "User 4",
    email: "user4@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=7",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-11-01 09:20",
  },
  {
    name: "User 5",
    email: "user5@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=8",
    role: "Editor",
    status: "Suspended",
    lastLogin: "2025-10-30 12:47",
  },
  {
    name: "User 6",
    email: "user6@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=9",
    role: "Viewer",
    status: "Active",
    lastLogin: "2025-10-25 08:15",
  },
  {
    name: "User 7",
    email: "user7@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=10",
    role: "Admin",
    status: "Suspended",
    lastLogin: "2025-10-22 18:49",
  },
  {
    name: "User 8",
    email: "user8@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=11",
    role: "Editor",
    status: "Active",
    lastLogin: "2025-10-19 20:20",
  },
  {
    name: "User 9",
    email: "user9@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    role: "Viewer",
    status: "Active",
    lastLogin: "2025-10-14 16:12",
  },
  {
    name: "User 10",
    email: "user10@example.com",
    avatarUrl: "https://i.pravatar.cc/100?img=13",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-10-12 11:17",
  },
];

export default function AdminProfileSecurityPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(FAKE_USERS);
      setLoading(false);
    }, 350);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
    setIsEditing(false);
  };

  const handleEditSave = (updatedUser) => {
    // Simulate PATCH/PUT API call here
    setUsers(
      users.map((u) =>
        u.email === updatedUser.email ? { ...u, ...updatedUser } : u
      )
    );
    setSelectedUser(updatedUser);
    setMessage(`User "${updatedUser.name}" updated!`);
  };

  const handleDelete = (user) => {
    // Simulate DELETE API call here
    if (window.confirm(`Really delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.email !== user.email));
      setSelectedUser(null);
      setDetailsOpen(false);
      setMessage(`User "${user.name}" deleted!`);
    }
  };

  // Add user logic:
  const handleAddUser = () => {
    setSelectedUser({
      name: "",
      email: "",
      avatarUrl: "https://i.pravatar.cc/100?img=14", // or your placeholder
      role: "",
      status: "Active",
      lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    setIsEditing(true);
    setAddOpen(true);
  };

  const handleAddUserSave = (newUser) => {
    // Simulate POST API call here
    setUsers([{ ...newUser }, ...users]);
    setMessage(`User "${newUser.name}" added!`);
    setAddOpen(false);
  };

  const handleClearMessage = () => setMessage("");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="font-bold text-2xl mb-6">Profile & Security</div>
        <div className="flex items-center mb-6 gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role"
              className="w-full max-w-lg"
            />
          </div>
          <button className="border rounded px-5 py-2 font-semibold bg-white hover:bg-gray-100 transition">
            View Logs
          </button>
          <button
            className="px-5 py-2 rounded font-semibold bg-green-600 text-white hover:bg-green-700 transition"
            onClick={handleAddUser}
          >
            + Add User
          </button>
        </div>

        <NotificationBar message={message} onClear={handleClearMessage} />

        <div
          className="border rounded p-4 bg-white overflow-y-auto"
          style={{ minHeight: "60vh", height: "calc(100vh - 260px)" }}
        >
          {loading ? (
            <div className="text-gray-500 text-center p-6">
              Loading users...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard
                key={user.email}
                user={user}
                onView={handleView}
                onEdit={handleView}
                onRemove={handleDelete}
              />
            ))
          ) : (
            <div className="text-gray-500 text-center p-6">No users found.</div>
          )}
        </div>

        {/* Edit/View modal */}
        <UserDetailsModal
          open={detailsOpen}
          user={selectedUser}
          onClose={() => setDetailsOpen(false)}
          onSave={handleEditSave}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onDelete={handleDelete}
          mode="edit"
        />
        {/* Add modal */}
        <UserDetailsModal
          open={addOpen}
          user={selectedUser}
          onClose={() => setAddOpen(false)}
          onSave={handleAddUserSave}
          isEditing={true}
          setIsEditing={() => {}}
          mode="add"
        />
      </main>
    </div>
  );
}
