import  {prisma}  from "@/lib/db"; // Import singleton Prisma instance
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 400 });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: expiry },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

    // Ensure email configurations are set correctly
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587, // Default to 587 if not set
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USERNAME, // Use a proper sender email
      to: email,
      subject: "Reset Password",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    return new Response(JSON.stringify({ message: "Check your email for password reset link" }), { status: 200 });
  } catch (error) {
    console.error("Error in password reset:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
