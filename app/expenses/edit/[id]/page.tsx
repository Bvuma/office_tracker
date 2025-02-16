"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditExpensePage() {
  const router = useRouter();
  const { id } = useParams();
  const expenseId = id?.toString(); // Ensure ID is treated as a string

  // State variables
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [qty, setQty] = useState("");
  const [uom, setUom] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission state

  useEffect(() => {
    if (!expenseId) return; // Prevent API calls if ID is missing

    async function fetchExpense() {
      try {
        const res = await fetch(`/api/expense/${expenseId}`);

        if (!res.ok) throw new Error(`Failed to fetch. Status: ${res.status}`);

        const data = await res.json();

        setTitle(data.title || "");
        setAmount(data.amount?.toString() || "");
        setQty(data.qty?.toString() || "");
        setUom(data.uom || "");
        setExpenseDate(data.expenseDate ? data.expenseDate.split("T")[0] : "");

        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
        setLoading(false);
      }
    }

    fetchExpense();
  }, [expenseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Validate input fields
    if (!title.trim()) return setError("Title is required.");
    if (!amount.trim() || isNaN(parseFloat(amount))) return setError("Valid amount is required.");
    if (!qty.trim() || isNaN(parseFloat(qty))) return setError("Valid quantity is required.");
    if (!uom.trim()) return setError("Unit of Measure (UOM) is required.");
    if (!expenseDate.trim()) return setError("Expense date is required.");

    setIsSubmitting(true); // Set submitting state to true

    try {
      const res = await fetch(`/api/expense/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          qty: parseFloat(qty),
          uom,
          expenseDate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Update failed. Status: ${res.status}`);
      }

      router.push("/expenses");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  }

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-xl font-bold mb-4">Edit Expense</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title"
          className="border p-2 w-full"
        />
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount"
          className="border p-2 w-full"
        />
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => setQty(e.target.value)} 
          placeholder="Quantity"
          className="border p-2 w-full"
        />
        <input 
          type="text" 
          value={uom} 
          onChange={(e) => setUom(e.target.value)} 
          placeholder="Unit of Measure (UOM)"
          className="border p-2 w-full"
        />
        <input 
          type="date" 
          value={expenseDate} 
          onChange={(e) => setExpenseDate(e.target.value)} 
          className="border p-2 w-full"
        />
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isSubmitting} // Disable the button while submitting
        >
          {isSubmitting ? "Updating..." : "Update Expense"}
        </button>
      </form>
    </div>
  );
}
