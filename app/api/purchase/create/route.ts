import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Update if your auth options path is different

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Ensure user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Extract user ID from session
    const data = await req.json();

    // Ensure required fields are present
    if (!data.title || !data.amount || !data.quantity || !data.datePurchased || !data.supplierId) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    // Create the purchase record in Prisma
    const purchase = await prisma.purchase.create({
      data: {
        title: data.title,
        amount: Number(data.amount),
        quantity: Number(data.quantity),
        datePurchased: new Date(data.datePurchased),
        supplierId: Number(data.supplierId),
        userId: Number(userId), // Include userId in the request
      },
    });

    return NextResponse.json(purchase, { status: 201 });

  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
