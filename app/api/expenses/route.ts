// app/api/expenses/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  // Ensure "insensitive" is treated as a literal
  const whereClause = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : {};

  try {
    const expenses = await prisma.expense.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: whereClause,
      include: { user: { select: { username: true } } },
    });
    const total = await prisma.expense.count({ where: whereClause });
    return NextResponse.json({ expenses, total, page, limit });
  } catch (error) {
    console.error("Error fetching expenses", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, amount, qty, uom, expenseDate } = await req.json();
    // Capture current user's id
    const userId = parseInt(session.user.id);
    const newExpense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        qty: parseInt(qty),
        uom,
        expenseDate: new Date(expenseDate),
        userId,
      },
    });
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
