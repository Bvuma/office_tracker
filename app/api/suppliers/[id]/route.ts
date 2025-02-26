// app/api/suppliers/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await params before using its properties
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { name, contact, address, email } = await req.json();
    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, contact, address, email },
    });
    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const deletedSupplier = await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Supplier deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting supplier", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
