"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpenseForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    qty: "",
    uom: "",
    expenseDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate inputs
  const validateForm = () => {
    if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      return "Amount must be a positive number.";
    }
    if (isNaN(parseFloat(form.qty)) || parseFloat(form.qty) <= 0) {
      return "Quantity must be a positive number.";
    }
    return "";
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = await fetch("/api/expenses/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Failed to create expense");
    } else {
      setSuccess("Expense added successfully!");
      setForm({ title: "", amount: "", qty: "", uom: "", expenseDate: "" });
      router.refresh();
    }
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Expense</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          className="w-full p-2 border rounded"
          value={form.title}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          required
          className="w-full p-2 border rounded"
          value={form.amount}
          onChange={handleChange}
        />
        <input
          type="number"
          name="qty"
          placeholder="Quantity"
          required
          className="w-full p-2 border rounded"
          value={form.qty}
          onChange={handleChange}
        />
        <input
          type="text"
          name="uom"
          placeholder="Unit of Measure (UOM)"
          required
          className="w-full p-2 border rounded"
          value={form.uom}
          onChange={handleChange}
        />
        <input
          type="date"
          name="expenseDate"
          required
          className="w-full p-2 border rounded"
          value={form.expenseDate}
          onChange={handleChange}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
