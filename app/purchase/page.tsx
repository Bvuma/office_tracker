"use client";

import { useEffect, useState } from "react";

interface Purchase {
  id: number;
  title: string;
  amount: number;
  quantity: number;
  datePurchased: string;
  supplierId: number;
}

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    quantity: "",
    datePurchased: "",
    supplierId: "",
  });

  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch purchases from API
  async function fetchPurchases() {
    try {
      const res = await fetch("/api/purchase/read", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
      const data = await res.json();
      setPurchases(data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Update Purchase
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    const endpoint = editingPurchase ? `/api/purchase/update/${editingPurchase.id}` : "/api/purchase/create";
    const method = editingPurchase ? "PUT" : "POST";
  
    const body = JSON.stringify({
      title: form.title,
      amount: parseFloat(form.amount),
      quantity: parseInt(form.quantity, 10),
      datePurchased: new Date(form.datePurchased).toISOString(),
      supplierId: parseInt(form.supplierId, 10),
    });
  
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
  
      const data = await res.json(); // Ensure response parsing
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to save purchase");
      }
  
      setSuccess(editingPurchase ? "Purchase updated successfully!" : "Purchase added successfully!");
      setForm({ title: "", amount: "", quantity: "", datePurchased: "", supplierId: "" });
      setEditingPurchase(null);
      fetchPurchases();
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        setError(error.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
    }
  }
  

  // Delete Purchase
  async function deletePurchase(id: number) {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;

    const res = await fetch(`/api/purchase/delete/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete purchase");
    } else {
      setSuccess("Purchase deleted successfully!");
      fetchPurchases();
    }
  }

  // Set purchase for editing
  function editPurchase(purchase: Purchase) {
    setEditingPurchase(purchase);
    setForm({
      title: purchase.title,
      amount: purchase.amount.toString(),
      quantity: purchase.quantity.toString(),
      datePurchased: purchase.datePurchased.split("T")[0],
      supplierId: purchase.supplierId.toString(),
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">{editingPurchase ? "Edit Purchase" : "Add Purchase"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="title" placeholder="Title" required className="w-full p-2 border rounded" value={form.title} onChange={handleChange} />
        <input type="number" name="amount" placeholder="Amount" required className="w-full p-2 border rounded" value={form.amount} onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" required className="w-full p-2 border rounded" value={form.quantity} onChange={handleChange} />
        <input type="date" name="datePurchased" required className="w-full p-2 border rounded" value={form.datePurchased} onChange={handleChange} />
        <input type="number" name="supplierId" placeholder="Supplier ID" required className="w-full p-2 border rounded" value={form.supplierId} onChange={handleChange} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{editingPurchase ? "Update" : "Submit"}</button>
      </form>

      <h2 className="text-xl font-bold mt-6">Purchases List</h2>
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Title</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td className="border p-2">{purchase.title}</td>
              <td className="border p-2">{purchase.amount}</td>
              <td className="border p-2">{purchase.quantity}</td>
              <td className="border p-2">{purchase.datePurchased.split("T")[0]}</td>
              <td className="border p-2">{purchase.supplierId}</td>
              <td className="border p-2">
                <button className="text-blue-500 mr-2" onClick={() => editPurchase(purchase)}>Edit</button>
                <button className="text-red-500" onClick={() => deletePurchase(purchase.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
