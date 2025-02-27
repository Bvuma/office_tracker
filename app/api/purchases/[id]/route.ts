// app/api/purchases/[id]/route.ts
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
    const { title, amount, quantity, datePurchased, supplierId } = await req.json();
    const updatedPurchase = await prisma.purchase.update({
      where: { id: parseInt(id) },
      data: {
        title,
        amount: parseFloat(amount),
        quantity: parseFloat(quantity),
        datePurchased: new Date(datePurchased),
        supplierId: parseInt(supplierId),
      },
    });
    return NextResponse.json(updatedPurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating purchase", error);
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    await prisma.purchase.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Purchase deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting purchase", error);
    return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 });
  }
}
