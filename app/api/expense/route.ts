import { NextResponse } from "next/server";
import {prisma} from "@/lib/db"; // Use singleton Prisma instance

// ✅ GET All Expenses
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany();
    return NextResponse.json(expenses || []);
  } catch (error: unknown) {
    console.error("Error fetching expenses:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ CREATE Expense (POST)
export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    // Guard against null or invalid payload
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { title, amount, qty, uom, expenseDate, userId } = requestBody;

    // Validate data
    if (!title || !amount || !qty || !uom || !expenseDate || !userId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Ensure amount & qty are numbers
    const parsedAmount = parseFloat(amount);
    const parsedQty = parseFloat(qty);

    if (isNaN(parsedAmount) || isNaN(parsedQty)) {
      return NextResponse.json({ error: "Invalid amount or quantity" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parsedAmount,
        qty: parsedQty,
        uom,
        expenseDate: new Date(expenseDate),
        userId,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating expense:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
