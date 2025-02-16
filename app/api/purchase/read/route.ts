import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany();
    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}
