// app/roles/RolesPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  permissions: any;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: "", // JSON string input
  });

  // Fetch roles on mount
  useEffect(() => {
    async function fetchRoles() {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    }
    fetchRoles();
  }, []);

  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create a new role
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          // Parse permissions or default to an empty object
          permissions: formData.permissions ? JSON.parse(formData.permissions) : {},
        }),
      });
      if (res.ok) {
        const newRole = await res.json();
        setRoles((prev) => [newRole, ...prev]);
        setFormData({ name: "", slug: "", description: "", permissions: "" });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  // Update an existing role
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRole) return;
    try {
      const res = await fetch(`/api/roles/${editRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          permissions: formData.permissions ? JSON.parse(formData.permissions) : {},
        }),
      });
      if (res.ok) {
        const updatedRole = await res.json();
        setRoles((prev) =>
          prev.map((role) => (role.id === updatedRole.id ? updatedRole : role))
        );
        setEditRole(null);
        setFormData({ name: "", slug: "", description: "", permissions: "" });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Prepare form for editing a role
  const handleEditClick = (role: Role) => {
    setEditRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      permissions: JSON.stringify(role.permissions, null, 2),
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditRole(null);
    setFormData({ name: "", slug: "", description: "", permissions: "" });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Roles Management</h1>
      <button
        onClick={() => {
          setIsCreating(true);
          setIsEditing(false);
          setFormData({ name: "", slug: "", description: "", permissions: "" });
        }}
        className="mb-4 px-4 py-2 bg-blue-500 text-white"
      >
        Add New Role
      </button>

      {(isCreating || isEditing) && (
        <form
          onSubmit={isEditing ? handleEdit : handleCreate}
          className="mb-4 border p-4 rounded"
        >
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Role" : "Create New Role"}
          </h2>
          <div className="mb-2">
            <label className="block mb-1">Name:</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Slug:</label>
            <input
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
              rows={3}
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Permissions (JSON):</label>
            <textarea
              name="permissions"
              value={formData.permissions}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
              rows={3}
              placeholder='e.g. {"read": true, "write": false}'
            />
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Role" : "Create Role"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Permissions</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="border p-2">{role.id}</td>
              <td className="border p-2">{role.name}</td>
              <td className="border p-2">{role.slug}</td>
              <td className="border p-2">{role.description}</td>
              <td className="border p-2">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(role.permissions, null, 2)}
                </pre>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(role)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                {/* Optional: Add a delete button here if needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
