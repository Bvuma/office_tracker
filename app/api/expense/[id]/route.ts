import { NextResponse } from "next/server";
import {prisma} from "@/lib/db"; // Ensure this is your Prisma instance

// GET Expense by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const expenseId = parseInt(id, 10);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE Expense by ID
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const expenseId = parseInt(id, 10);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { title, amount, qty, uom, expenseDate } = body;

    // Ensure required fields are present
    if (!title || amount === undefined || qty === undefined || !uom || !expenseDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure valid numeric values
    const parsedAmount = parseFloat(amount);
    const parsedQty = parseFloat(qty);

    if (isNaN(parsedAmount) || isNaN(parsedQty)) {
      return NextResponse.json({ error: "Invalid amount or quantity" }, { status: 400 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        title,
        amount: parsedAmount,
        qty: parsedQty,
        uom,
        expenseDate: new Date(expenseDate),
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
