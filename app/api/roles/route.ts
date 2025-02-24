import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
    try {
      const roles = await prisma.role.findMany({
        where: { deletedAt: null }, 
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(roles, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
  }




export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, slug, description, permissions } = await req.json();

    const newRole = await prisma.role.create({
      data: { name, slug, description, permissions },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
