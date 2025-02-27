// app/api/purchases/route.ts
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

  // Search in the purchase title (you can add other fields if needed)
  const whereClause = search
    ? { title: { contains: search, mode: "insensitive" as const} }
    : {};

  try {
    const purchases = await prisma.purchase.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: whereClause,
      include: {
        supplier: { select: { id: true, name: true } },
        user: { select: { username: true } },
      },
    });
    const total = await prisma.purchase.count({ where: whereClause });
    return NextResponse.json({ purchases, total, page, limit });
  } catch (error) {
    console.error("Error fetching purchases", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, amount, quantity, datePurchased, supplierId } = await req.json();
    // Capture current user's id
    const userId = parseInt(session.user.id);
    const newPurchase = await prisma.purchase.create({
      data: {
        title,
        amount: parseFloat(amount),
        quantity: parseFloat(quantity),
        datePurchased: new Date(datePurchased),
        supplierId: parseInt(supplierId),
        userId,
      },
    });
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
