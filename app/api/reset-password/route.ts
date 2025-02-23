import { NextResponse } from "next/server";
import {prisma} from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // ✅ Use findFirst instead of findUnique since resetPasswordToken is not unique
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword, 
        resetPasswordToken: null, 
        resetPasswordExpires: null 
      },
    });

    return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error resetting password:", error);

    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
