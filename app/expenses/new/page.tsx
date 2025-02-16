"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ExpenseForm() {
  const { data: session } = useSession();
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

  const userId = session?.user?.id;

  if (!session) return <p>Loading...</p>;
  if (!userId) return <p className="text-red-500">You must be logged in to add an expense.</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
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
        <div>
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Quantity</label>
          <input
            type="number"
            name="qty"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Unit of Measure (UOM)</label>
          <input
            type="text"
            name="uom"
            value={form.uom}
            onChange={(e) => setForm({ ...form, uom: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Expense Date</label>
          <input
            type="date"
            name="expenseDate"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Submit Expense
        </button>
      </form>
    </div>
  );
}
