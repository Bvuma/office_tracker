import { NextResponse } from 'next/server';
import prisma from '../../../lib/db'; // Adjust based on your Prisma setup

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    // Find user by token
    const user = await prisma.user.findFirst({
      where: { emailVerifToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Update user's verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifToken: null, // Clear the token after verification
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error during email verification:", error); // Log error for debugging
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
