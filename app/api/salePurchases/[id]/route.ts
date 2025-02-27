// app/api/salePurchases/[id]/route.ts
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
    const { purchaseId, saleId, quantityUsed, uom } = await req.json();
    const updatedSalePurchase = await prisma.salePurchase.update({
      where: { id: parseInt(id) },
      data: {
        purchaseId: parseInt(purchaseId),
        saleId: parseInt(saleId),
        quantityUsed: parseFloat(quantityUsed),
        uom,
      },
    });
    return NextResponse.json(updatedSalePurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating salePurchase", error);
    return NextResponse.json({ error: "Failed to update salePurchase" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    await prisma.salePurchase.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "salePurchase deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting salePurchase", error);
    return NextResponse.json({ error: "Failed to delete salePurchase" }, { status: 500 });
  }
}
