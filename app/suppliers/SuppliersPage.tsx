// app/suppliers/SuppliersPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Supplier {
    id: number;
    name: string;
    contact: string;
    address: string;
    email: string;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    creator?: { // Added to include creator data
      username: string;
    };
  }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    email: "",
  });

  // Fetch suppliers on mount
  useEffect(() => {
    async function fetchSuppliers() {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    }
    fetchSuppliers();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create a new supplier
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newSupplier = await res.json();
        setSuppliers((prev) => [newSupplier, ...prev]);
        setFormData({ name: "", contact: "", address: "", email: "" });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  // Update an existing supplier
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSupplier) return;
    try {
      const res = await fetch(`/api/suppliers/${editSupplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedSupplier = await res.json();
        setSuppliers((prev) =>
          prev.map((supplier) => (supplier.id === updatedSupplier.id ? updatedSupplier : supplier))
        );
        setEditSupplier(null);
        setFormData({ name: "", contact: "", address: "", email: "" });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  // Delete a supplier
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  // Prepare form for editing
  const handleEditClick = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address,
      email: supplier.email,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditSupplier(null);
    setFormData({ name: "", contact: "", address: "", email: "" });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Suppliers Management</h1>
      <button
        onClick={() => {
          setIsCreating(true);
          setIsEditing(false);
          setFormData({ name: "", contact: "", address: "", email: "" });
        }}
        className="mb-4 px-4 py-2 bg-blue-500 text-white"
      >
        Add New Supplier
      </button>

      {(isCreating || isEditing) && (
        <form onSubmit={isEditing ? handleEdit : handleCreate} className="mb-4 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Supplier" : "Create New Supplier"}
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
            <label className="block mb-1">Contact:</label>
            <input
              name="contact"
              type="text"
              value={formData.contact}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Address:</label>
            <input
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Email:</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Supplier" : "Create Supplier"}
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
            <th className="border p-2">Contact</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="border p-2">{supplier.id}</td>
              <td className="border p-2">{supplier.name}</td>
              <td className="border p-2">{supplier.contact}</td>
              <td className="border p-2">{supplier.address}</td>
              <td className="border p-2">{supplier.email}</td>
              <td className="border p-2">
                {supplier.creator ? supplier.creator.username : "N/A"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(supplier)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="px-2 py-1 bg-red-500 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
