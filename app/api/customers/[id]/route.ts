// app/api/customers/[id]/route.ts
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
    const { c_name, address, contact, email, type } = await req.json();
    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { c_name, address, contact, email, type },
    });
    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    console.error("Error updating customer", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Customer deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
