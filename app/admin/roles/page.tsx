'use client';

import { useState, useEffect } from "react";

// Define the type for a User
interface User {
  id: string;
  username: string;
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]); // Explicitly type users as an array of User objects
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Update user role function
  const updateRole = async () => {
    if (!selectedUserId || !roleId) {
      setMessage("Please select a user and a role.");
      return;
    }

    const response = await fetch("/api/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId, roleId }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Role updated successfully!");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Update User Role</h1>

      {/* Dropdown to Select User */}
      <select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        className="border p-2 mb-2"
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>

      {/* Role Input */}
      <input
        type="number"
        placeholder="Role ID"
        value={roleId}
        onChange={(e) => setRoleId(e.target.value)}
        className="border p-2 ml-2"
      />

      {/* Update Button */}
      <button onClick={updateRole} className="bg-blue-500 text-white p-2 ml-2">
        Update Role
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}