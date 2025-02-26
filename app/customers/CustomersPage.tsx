// app/customers/CustomersPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Customer {
  id: number;
  c_name: string;
  address: string | null;
  contact: string;
  email: string;
  type: string;
  createdAt: string;
  userId: number;
  user?: {
    username: string;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(totalCustomers / limit);

  // States for form handling
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    c_name: "",
    address: "",
    contact: "",
    email: "",
    type: "Individual", // default value
  });

  // Fetch customers on component mount and on pagination changes
  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch(`/api/customers?page=${currentPage}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setTotalCustomers(data.total);
      }
    }
    fetchCustomers();
  }, [currentPage, limit]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create a new customer
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ c_name: "", address: "", contact: "", email: "", type: "Individual" });
        setIsCreating(false);
        const fetchRes = await fetch(`/api/customers?page=${currentPage}&limit=${limit}`);
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setCustomers(data.customers);
          setTotalCustomers(data.total);
        }
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  // Update an existing customer
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    try {
      const res = await fetch(`/api/customers/${editCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditCustomer(null);
        setFormData({ c_name: "", address: "", contact: "", email: "", type: "Individual" });
        setIsEditing(false);
        const fetchRes = await fetch(`/api/customers?page=${currentPage}&limit=${limit}`);
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setCustomers(data.customers);
          setTotalCustomers(data.total);
        }
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  // Delete a customer
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
        if (res.ok) {
          const fetchRes = await fetch(`/api/customers?page=${currentPage}&limit=${limit}`);
          if (fetchRes.ok) {
            const data = await fetchRes.json();
            setCustomers(data.customers);
            setTotalCustomers(data.total);
          }
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  // Prepare form for editing a customer
  const handleEditClick = (customer: Customer) => {
    setEditCustomer(customer);
    setFormData({
      c_name: customer.c_name,
      address: customer.address || "",
      contact: customer.contact,
      email: customer.email,
      type: customer.type,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditCustomer(null);
    setFormData({ c_name: "", address: "", contact: "", email: "", type: "Individual" });
  };

  // Pagination functions
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <button
        onClick={() => {
          setIsCreating(true);
          setIsEditing(false);
          setFormData({ c_name: "", address: "", contact: "", email: "", type: "Individual" });
        }}
        className="mb-4 px-4 py-2 bg-blue-500 text-white"
      >
        Add New Customer
      </button>

      {(isCreating || isEditing) && (
        <form onSubmit={isEditing ? handleEdit : handleCreate} className="mb-4 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Customer" : "Create New Customer"}
          </h2>
          <div className="mb-2">
            <label className="block mb-1">Customer Name:</label>
            <input
              name="c_name"
              type="text"
              value={formData.c_name}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
              rows={2}
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
          <div className="mb-2">
            <label className="block mb-1">Type:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            >
              <option value="Individual">Individual</option>
              <option value="Company/Business">Company/Business</option>
            </select>
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Customer" : "Create Customer"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Customer Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="border p-2">{customer.id}</td>
              <td className="border p-2">{customer.c_name}</td>
              <td className="border p-2">{customer.contact}</td>
              <td className="border p-2">{customer.email}</td>
              <td className="border p-2">{customer.type}</td>
              <td className="border p-2">
                {customer.user ? customer.user.username : "N/A"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(customer)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="px-2 py-1 bg-red-500 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
