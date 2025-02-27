// app/api/sales/[id]/route.ts
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
    const { title, amount, quantity, dateSold, customerId } = await req.json();
    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: {
        title,
        amount: parseFloat(amount),
        quantity: parseInt(quantity),
        dateSold: new Date(dateSold),
        customerId: parseInt(customerId),
      },
    });
    return NextResponse.json(updatedSale, { status: 200 });
  } catch (error) {
    console.error("Error updating sale", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    await prisma.sale.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Sale deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting sale", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
