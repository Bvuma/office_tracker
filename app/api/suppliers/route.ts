// app/api/suppliers/route.ts
import { NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, contact, address, email } = await req.json();
    // Capture the current user’s id as createdBy (convert to integer)
    const createdBy = parseInt(session.user.id);
    const newSupplier = await prisma.supplier.create({
      data: { name, contact, address, email, createdBy },
    });
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
