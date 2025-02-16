import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: "Missing userId or roleId" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { roleId: parseInt(roleId) }, // Ensure roleId is correctly stored
    });

    return NextResponse.json({ message: "Role updated successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
