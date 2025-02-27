// app/api/sales/route.ts
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

  const whereClause = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : {};

  try {
    const sales = await prisma.sale.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: whereClause,
      include: {
        customer: { select: { id: true, c_name: true } },
        user: { select: { username: true } },
      },
    });
    const total = await prisma.sale.count({ where: whereClause });
    return NextResponse.json({ sales, total, page, limit });
  } catch (error) {
    console.error("Error fetching sales", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, amount, quantity, dateSold, customerId } = await req.json();
    const userId = parseInt(session.user.id);
    const newSale = await prisma.sale.create({
      data: {
        title,
        amount: parseFloat(amount),
        quantity: parseInt(quantity),
        dateSold: new Date(dateSold),
        customerId: parseInt(customerId),
        userId,
      },
    });
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
