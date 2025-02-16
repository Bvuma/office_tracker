"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
  id: number;
  title: string;
  amount: number;
  qty: number;
  uom: string;
  expenseDate: string;
  userId: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch expenses
  useEffect(() => {
    async function fetchExpenses() {
      try {
        const res = await fetch("/api/expense");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch {
        setError("An error occurred while fetching the expenses.");
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  // Delete Expense
  async function deleteExpense(id: number) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    // Optimistic UI update: immediately remove expense from state
    const updatedExpenses = expenses.filter((exp) => exp.id !== id);
    setExpenses(updatedExpenses);

    try {
      const res = await fetch(`/api/expense/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
    } catch {
      setError("An error occurred while deleting the expense.");
      // Revert the optimistic update if deletion failed
      setExpenses(expenses);
    }
  }

  if (loading) return <p>Loading expenses...</p>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      {/* Display error message if any error exists */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => router.push("/expenses/new")}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Expense
      </button>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Qty</th>
            <th className="border px-4 py-2">UOM</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="text-center">
              <td className="border px-4 py-2">{exp.title}</td>
              <td className="border px-4 py-2">{exp.amount}</td>
              <td className="border px-4 py-2">{exp.qty}</td>
              <td className="border px-4 py-2">{exp.uom}</td>
              <td className="border px-4 py-2">{new Date(exp.expenseDate).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => router.push(`/expenses/edit/${exp.id}`)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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
