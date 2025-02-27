// app/sales/SalesPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Sale {
  id: number;
  title: string;
  amount: number;
  quantity: number;
  dateSold: string;
  createdAt: string;
  customerId: number;
  userId: number;
  customer?: {
    id: number;
    c_name: string;
  };
  user?: {
    username: string;
  };
}

interface Customer {
  id: number;
  c_name: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(totalSales / limit);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    quantity: "",
    dateSold: "",
    customerId: "", // as string
  });

  // Fetch sales with pagination and search
  useEffect(() => {
    async function fetchSales() {
      const res = await fetch(
        `/api/sales?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales);
        setTotalSales(data.total);
      }
    }
    fetchSales();
  }, [currentPage, limit, searchTerm]);

  // Fetch customers for the dropdown
  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (!formData.customerId && data.length > 0) {
          setFormData((prev) => ({ ...prev, customerId: data[0].id.toString() }));
        }
      }
    }
    fetchCustomers();
  }, []);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Create a new sale
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const fetchRes = await fetch(
          `/api/sales?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setSales(data.sales);
          setTotalSales(data.total);
        }
        setFormData({
          title: "",
          amount: "",
          quantity: "",
          dateSold: "",
          customerId: customers[0]?.id.toString() || "",
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  // Update an existing sale
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSale) return;
    try {
      const res = await fetch(`/api/sales/${editSale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedSale = await res.json();
        setSales((prev) =>
          prev.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale))
        );
        setEditSale(null);
        setFormData({
          title: "",
          amount: "",
          quantity: "",
          dateSold: "",
          customerId: customers[0]?.id.toString() || "",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating sale:", error);
    }
  };

  // Delete a sale
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSales((prev) => prev.filter((sale) => sale.id !== id));
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

  // Prepare form for editing a sale
  const handleEditClick = (sale: Sale) => {
    setEditSale(sale);
    setFormData({
      title: sale.title,
      amount: sale.amount.toString(),
      quantity: sale.quantity.toString(),
      dateSold: sale.dateSold.slice(0, 16), // Format for datetime-local
      customerId: sale.customerId.toString(),
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditSale(null);
    setFormData({
      title: "",
      amount: "",
      quantity: "",
      dateSold: "",
      customerId: customers[0]?.id.toString() || "",
    });
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Management</h1>
      
      {/* Search Input and Create Button */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border px-2 py-1 w-64 mr-4"
        />
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setFormData({
              title: "",
              amount: "",
              quantity: "",
              dateSold: "",
              customerId: customers[0]?.id.toString() || "",
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white"
        >
          Add New Sale
        </button>
      </div>
      
      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <form
          onSubmit={isEditing ? handleEdit : handleCreate}
          className="mb-4 border p-4 rounded"
        >
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Sale" : "Create New Sale"}
          </h2>
          <div className="mb-2">
            <label className="block mb-1">Title:</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Amount:</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Quantity:</label>
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Date Sold:</label>
            <input
              name="dateSold"
              type="datetime-local"
              value={formData.dateSold}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Customer:</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.c_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Sale" : "Create Sale"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Sales Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Date Sold</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="border p-2">{sale.id}</td>
              <td className="border p-2">{sale.title}</td>
              <td className="border p-2">{sale.amount}</td>
              <td className="border p-2">{sale.quantity}</td>
              <td className="border p-2">{new Date(sale.dateSold).toLocaleString()}</td>
              <td className="border p-2">{sale.customer ? sale.customer.c_name : "N/A"}</td>
              <td className="border p-2">{sale.user ? sale.user.username : "N/A"}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(sale)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sale.id)}
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
      <div className="flex justify-between items-center mt-4">
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
