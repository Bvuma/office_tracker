// app/api/salePurchases/route.ts
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

  // Filter by uom if a search term is provided
  const whereClause = search
    ? { uom: { contains: search, mode: "insensitive" as const } }
    : {};

  try {
    const salePurchases = await prisma.salePurchase.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: whereClause,
      include: {
        purchase: { select: { id: true, title: true } },
        sale: { select: { id: true, title: true } },
        user: { select: { username: true } },
      },
    });
    const total = await prisma.salePurchase.count({ where: whereClause });
    return NextResponse.json({ salePurchases, total, page, limit });
  } catch (error) {
    console.error("Error fetching salePurchases", error);
    return NextResponse.json({ error: "Failed to fetch salePurchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { purchaseId, saleId, quantityUsed, uom } = await req.json();
    const userId = parseInt(session.user.id);
    const newSalePurchase = await prisma.salePurchase.create({
      data: {
        purchaseId: parseInt(purchaseId),
        saleId: parseInt(saleId),
        quantityUsed: parseFloat(quantityUsed),
        uom,
        userId,
      },
    });
    return NextResponse.json(newSalePurchase, { status: 201 });
  } catch (error) {
    console.error("Error creating salePurchase", error);
    return NextResponse.json({ error: "Failed to create salePurchase" }, { status: 500 });
  }
}
