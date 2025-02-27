// app/api/expenses/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, amount, qty, uom, expenseDate } = await req.json();
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title,
        amount: parseFloat(amount),
        qty: parseInt(qty),
        uom,
        expenseDate: new Date(expenseDate),
      },
    });
    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error("Error updating expense", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Expense deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting expense", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
