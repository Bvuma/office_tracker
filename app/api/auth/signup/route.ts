import prisma from "@/lib/db"; // Import singleton Prisma instance
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Invalid JSON request" }), { status: 400 });
    }

    const { username, email, password, role } = requestBody;

    // Default role ID if role is not provided
    const roleSlug = role || 'admin'; // Change to match your default role's slug

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }, // Ensure uniqueness check for both fields
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email or Username already in use" }), { status: 400 });
    }

    // Fetch role from the database based on the role slug or use default role
    const roleRecord = await prisma.role.findUnique({
      where: { slug: roleSlug },
    });

    if (!roleRecord) {
      return new Response(JSON.stringify({ error: "Invalid role specified" }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a secure email verification token
    const emailVerifToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        emailVerifToken,
        role: { connect: { id: roleRecord.id } }, // Correct way to assign role
      },
    });

    // Email Verification Link
    const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${emailVerifToken}`;

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587, // Default to 587
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Send verification email
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USERNAME, // Use a proper sender email
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
      });
    } catch (emailError) {
      console.error("Email Sending Error:", emailError);
    }

    return new Response(
      JSON.stringify({ message: "Check your email for verification link", user: newUser }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Signup Error:", error.message || error); // Log the actual error
    return new Response(JSON.stringify({ error: error.message || "Error creating account" }), { status: 500 });
  }
}
