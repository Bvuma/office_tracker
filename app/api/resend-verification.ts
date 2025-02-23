import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/db"; // Adjust this import based on your project
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a new verification token
    const newToken = crypto.randomBytes(32).toString("hex");

    // Update the user in the database
    await prisma.user.update({
      where: { email },
      data: {
        emailVerifToken: newToken,
      },
    });

    // Create a new verification link
    const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${newToken}`;

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,  // Default port set if undefined
      secure: process.env.EMAIL_PORT === "465",  // Use SSL for port 465
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Send verification email
    await transporter.sendMail({
      from: process.env.USERNAME,
      to: email,
      subject: "Resend: Verify Your Email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    return NextResponse.json({ message: "Verification email resent" }, { status: 200 });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return NextResponse.json({ error: "Error resending verification email. Please try again later." }, { status: 500 });
  }
}
