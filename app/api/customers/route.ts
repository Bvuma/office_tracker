// app/api/customers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const customers = await prisma.customer.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
      },
    });
    const total = await prisma.customer.count();
    return NextResponse.json({ customers, total, page, limit });
  } catch (error) {
    console.error("Error fetching customers", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const { c_name, address, contact, email, type } = await req.json();
      // Capture the current user's ID for the customer record
      const userId = parseInt(session.user.id);
      const newCustomer = await prisma.customer.create({
        data: { c_name, address, contact, email, type, userId },
      });
      return NextResponse.json(newCustomer, { status: 201 });
    } catch (error) {
      console.error("Error creating customer", error);
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
  }