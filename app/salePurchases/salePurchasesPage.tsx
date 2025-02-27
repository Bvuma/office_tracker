// app/salePurchases/SalePurchasesPage.tsx
"use client";

import { useState, useEffect } from "react";

interface SalePurchase {
  id: number;
  purchaseId: number;
  saleId: number;
  quantityUsed: number;
  uom: string;
  createdAt: string;
  userId: number;
  user?: { username: string };
  purchase?: { id: number; title: string };
  sale?: { id: number; title: string };
}

interface PurchaseOption {
  id: number;
  title: string;
}

interface SaleOption {
  id: number;
  title: string;
}

export default function SalePurchasesPage() {
  const [salePurchases, setSalePurchases] = useState<SalePurchase[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOption[]>([]);
  const [sales, setSales] = useState<SaleOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(totalRecords / limit);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for creating/updating
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSalePurchase, setEditSalePurchase] = useState<SalePurchase | null>(null);
  const [formData, setFormData] = useState({
    purchaseId: "",
    saleId: "",
    quantityUsed: "",
    uom: "",
  });

  // Fetch salePurchase records with pagination and search
  useEffect(() => {
    async function fetchSalePurchases() {
      const res = await fetch(
        `/api/salePurchases?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSalePurchases(data.salePurchases);
        setTotalRecords(data.total);
      }
    }
    fetchSalePurchases();
  }, [currentPage, limit, searchTerm]);

  // Fetch purchases for dropdown
  useEffect(() => {
    async function fetchPurchases() {
      const res = await fetch("/api/purchases");
      if (res.ok) {
        const data = await res.json();
        // Map to only include id and title
        setPurchases(data.map((p: any) => ({ id: p.id, title: p.title })));
        if (!formData.purchaseId && data.length > 0) {
          setFormData((prev) => ({ ...prev, purchaseId: data[0].id.toString() }));
        }
      }
    }
    fetchPurchases();
  }, []);

  // Fetch sales for dropdown
  useEffect(() => {
    async function fetchSales() {
      const res = await fetch("/api/sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data.map((s: any) => ({ id: s.id, title: s.title })));
        if (!formData.saleId && data.length > 0) {
          setFormData((prev) => ({ ...prev, saleId: data[0].id.toString() }));
        }
      }
    }
    fetchSales();
  }, []);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Create a new salePurchase record
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/salePurchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const fetchRes = await fetch(
          `/api/salePurchases?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setSalePurchases(data.salePurchases);
          setTotalRecords(data.total);
        }
        setFormData({
          purchaseId: purchases[0]?.id.toString() || "",
          saleId: sales[0]?.id.toString() || "",
          quantityUsed: "",
          uom: "",
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating salePurchase:", error);
    }
  };

  // Update an existing salePurchase record
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSalePurchase) return;
    try {
      const res = await fetch(`/api/salePurchases/${editSalePurchase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedSalePurchase = await res.json();
        setSalePurchases((prev) =>
          prev.map((sp) => (sp.id === updatedSalePurchase.id ? updatedSalePurchase : sp))
        );
        setEditSalePurchase(null);
        setFormData({
          purchaseId: purchases[0]?.id.toString() || "",
          saleId: sales[0]?.id.toString() || "",
          quantityUsed: "",
          uom: "",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating salePurchase:", error);
    }
  };

  // Delete a salePurchase record
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const res = await fetch(`/api/salePurchases/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSalePurchases((prev) => prev.filter((sp) => sp.id !== id));
        }
      } catch (error) {
        console.error("Error deleting salePurchase:", error);
      }
    }
  };

  // Prepare form for editing
  const handleEditClick = (sp: SalePurchase) => {
    setEditSalePurchase(sp);
    setFormData({
      purchaseId: sp.purchaseId.toString(),
      saleId: sp.saleId.toString(),
      quantityUsed: sp.quantityUsed.toString(),
      uom: sp.uom,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditSalePurchase(null);
    setFormData({
      purchaseId: purchases[0]?.id.toString() || "",
      saleId: sales[0]?.id.toString() || "",
      quantityUsed: "",
      uom: "",
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
      <h1 className="text-2xl font-bold mb-4">Sale Purchases Management</h1>
      
      {/* Search Input and Create Button */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by UOM..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border px-2 py-1 w-64 mr-4"
        />
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setFormData({
              purchaseId: purchases[0]?.id.toString() || "",
              saleId: sales[0]?.id.toString() || "",
              quantityUsed: "",
              uom: "",
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white"
        >
          Add New Sale Purchase
        </button>
      </div>
      
      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <form onSubmit={isEditing ? handleEdit : handleCreate} className="mb-4 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Sale Purchase" : "Create New Sale Purchase"}
          </h2>
          <div className="mb-2">
            <label className="block mb-1">Purchase:</label>
            <select
              name="purchaseId"
              value={formData.purchaseId}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            >
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1">Sale:</label>
            <select
              name="saleId"
              value={formData.saleId}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            >
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1">Quantity Used:</label>
            <input
              name="quantityUsed"
              type="number"
              step="0.01"
              value={formData.quantityUsed}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">UOM:</label>
            <input
              name="uom"
              type="text"
              value={formData.uom}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Sale Purchase" : "Create Sale Purchase"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Sale Purchases Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Purchase</th>
            <th className="border p-2">Sale</th>
            <th className="border p-2">Quantity Used</th>
            <th className="border p-2">UOM</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salePurchases.map((sp) => (
            <tr key={sp.id}>
              <td className="border p-2">{sp.id}</td>
              <td className="border p-2">{sp.purchase ? sp.purchase.title : "N/A"}</td>
              <td className="border p-2">{sp.sale ? sp.sale.title : "N/A"}</td>
              <td className="border p-2">{sp.quantityUsed}</td>
              <td className="border p-2">{sp.uom}</td>
              <td className="border p-2">{sp.user ? sp.user.username : "N/A"}</td>
              <td className="border p-2">{new Date(sp.createdAt).toLocaleString()}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(sp)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sp.id)}
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
