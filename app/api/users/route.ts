import { NextResponse } from "next/server";
import {prisma} from "@/lib/db"; // Adjust path based on your Prisma setup

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true, // Fetch only ID and username
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
