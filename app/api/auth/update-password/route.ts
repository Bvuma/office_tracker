import  prisma  from "@/lib/db"; // Import Prisma singleton
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // Find user with a valid (non-expired) reset token
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return new Response(JSON.stringify({ message: "Password reset successful" }), { status: 200 });
  } catch (error) {
    console.error("Password Reset Error:", error);
    return new Response(JSON.stringify({ error: "Error resetting password" }), { status: 500 });
  }
}
