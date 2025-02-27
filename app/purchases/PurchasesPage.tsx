// app/purchases/PurchasesPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Purchase {
  id: number;
  title: string;
  amount: number;
  quantity: number;
  datePurchased: string;
  createdAt: string;
  supplierId: number;
  userId: number;
  supplier?: {
    id: number;
    name: string;
  };
  user?: {
    username: string;
  };
}

interface Supplier {
  id: number;
  name: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(totalPurchases / limit);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    quantity: "",
    datePurchased: "",
    supplierId: "",
  });

  // Fetch purchases with pagination and search
  useEffect(() => {
    async function fetchPurchases() {
      const res = await fetch(
        `/api/purchases?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases);
        setTotalPurchases(data.total);
      }
    }
    fetchPurchases();
  }, [currentPage, limit, searchTerm]);

  // Fetch suppliers for the dropdown
  useEffect(() => {
    async function fetchSuppliers() {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
        // Default supplier selection if not set
        if (!formData.supplierId && data.length > 0) {
          setFormData((prev) => ({ ...prev, supplierId: data[0].id.toString() }));
        }
      }
    }
    fetchSuppliers();
  }, []);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle search field changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on new search
  };

  // Create a new purchase
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        // Refetch current purchases after creation
        const fetchRes = await fetch(
          `/api/purchases?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setPurchases(data.purchases);
          setTotalPurchases(data.total);
        }
        setFormData({
          title: "",
          amount: "",
          quantity: "",
          datePurchased: "",
          supplierId: suppliers[0]?.id.toString() || "",
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
    }
  };

  // Update an existing purchase
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPurchase) return;
    try {
      const res = await fetch(`/api/purchases/${editPurchase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedPurchase = await res.json();
        setPurchases((prev) =>
          prev.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p))
        );
        setEditPurchase(null);
        setFormData({
          title: "",
          amount: "",
          quantity: "",
          datePurchased: "",
          supplierId: suppliers[0]?.id.toString() || "",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
    }
  };

  // Delete a purchase
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      try {
        const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
        if (res.ok) {
          setPurchases((prev) => prev.filter((p) => p.id !== id));
        }
      } catch (error) {
        console.error("Error deleting purchase:", error);
      }
    }
  };

  // Prepare form for editing
  const handleEditClick = (purchase: Purchase) => {
    setEditPurchase(purchase);
    setFormData({
      title: purchase.title,
      amount: purchase.amount.toString(),
      quantity: purchase.quantity.toString(),
      datePurchased: purchase.datePurchased.slice(0, 16), // Format for datetime-local input
      supplierId: purchase.supplierId.toString(),
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditPurchase(null);
    setFormData({
      title: "",
      amount: "",
      quantity: "",
      datePurchased: "",
      supplierId: suppliers[0]?.id.toString() || "",
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
      <h1 className="text-2xl font-bold mb-4">Purchases Management</h1>

      {/* Search and Create Button */}
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
              datePurchased: "",
              supplierId: suppliers[0]?.id.toString() || "",
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white"
        >
          Add New Purchase
        </button>
      </div>

      {/* Form for Create / Edit */}
      {(isCreating || isEditing) && (
        <form
          onSubmit={isEditing ? handleEdit : handleCreate}
          className="mb-4 border p-4 rounded"
        >
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Purchase" : "Create New Purchase"}
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
              step="0.01"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Date Purchased:</label>
            <input
              name="datePurchased"
              type="datetime-local"
              value={formData.datePurchased}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Supplier:</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Purchase" : "Create Purchase"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Purchases Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Date Purchased</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td className="border p-2">{purchase.id}</td>
              <td className="border p-2">{purchase.title}</td>
              <td className="border p-2">{purchase.amount}</td>
              <td className="border p-2">{purchase.quantity}</td>
              <td className="border p-2">
                {new Date(purchase.datePurchased).toLocaleString()}
              </td>
              <td className="border p-2">
                {purchase.supplier ? purchase.supplier.name : "N/A"}
              </td>
              <td className="border p-2">
                {purchase.user ? purchase.user.username : "N/A"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(purchase)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(purchase.id)}
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
