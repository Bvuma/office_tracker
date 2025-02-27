// app/expenses/ExpensesPage.tsx
"use client";

import { useState, useEffect } from "react";

interface Expense {
  id: number;
  ref_no: string;
  title: string;
  amount: number;
  qty: number;
  uom: string;
  expenseDate: string;
  createdAt: string;
  userId: number;
  user?: {
    username: string;
  };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(totalExpenses / limit);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    qty: "",
    uom: "",
    expenseDate: "", // Expected format for datetime-local input: "YYYY-MM-DDTHH:MM"
  });

  // Fetch expenses with pagination and search
  useEffect(() => {
    async function fetchExpenses() {
      const res = await fetch(
        `/api/expenses?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
        setTotalExpenses(data.total);
      }
    }
    fetchExpenses();
  }, [currentPage, limit, searchTerm]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Create a new expense
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const fetchRes = await fetch(
          `/api/expenses?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setExpenses(data.expenses);
          setTotalExpenses(data.total);
        }
        setFormData({ title: "", amount: "", qty: "", uom: "", expenseDate: "" });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  // Update an existing expense
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExpense) return;
    try {
      const res = await fetch(`/api/expenses/${editExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedExpense = await res.json();
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
        );
        setEditExpense(null);
        setFormData({ title: "", amount: "", qty: "", uom: "", expenseDate: "" });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  // Delete an expense
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        if (res.ok) {
          setExpenses((prev) => prev.filter((exp) => exp.id !== id));
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  // Prepare form for editing an expense
  const handleEditClick = (expense: Expense) => {
    setEditExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      qty: expense.qty.toString(),
      uom: expense.uom,
      expenseDate: expense.expenseDate.slice(0, 16), // Format for datetime-local input
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form action
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditExpense(null);
    setFormData({ title: "", amount: "", qty: "", uom: "", expenseDate: "" });
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
      <h1 className="text-2xl font-bold mb-4">Expenses Management</h1>

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
            setFormData({ title: "", amount: "", qty: "", uom: "", expenseDate: "" });
          }}
          className="px-4 py-2 bg-blue-500 text-white"
        >
          Add New Expense
        </button>
      </div>

      {/* Form for Create / Edit */}
      {(isCreating || isEditing) && (
        <form onSubmit={isEditing ? handleEdit : handleCreate} className="mb-4 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Expense" : "Create New Expense"}
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
              name="qty"
              type="number"
              value={formData.qty}
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
          <div className="mb-2">
            <label className="block mb-1">Expense Date:</label>
            <input
              name="expenseDate"
              type="datetime-local"
              value={formData.expenseDate}
              onChange={handleChange}
              required
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <button type="submit" className="mr-2 px-4 py-2 bg-green-500 text-white">
              {isEditing ? "Update Expense" : "Create Expense"}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Ref No</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">UOM</th>
            <th className="border p-2">Expense Date</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="border p-2">{expense.id}</td>
              <td className="border p-2">{expense.ref_no}</td>
              <td className="border p-2">{expense.title}</td>
              <td className="border p-2">{expense.amount}</td>
              <td className="border p-2">{expense.qty}</td>
              <td className="border p-2">{expense.uom}</td>
              <td className="border p-2">{new Date(expense.expenseDate).toLocaleString()}</td>
              <td className="border p-2">
                {expense.user ? expense.user.username : "N/A"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditClick(expense)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
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
