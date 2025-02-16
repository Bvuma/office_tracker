import { PrismaClient } from "@prisma/client";
import { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true }, // Include role relation
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.emailVerifiedAt) {
          throw new Error("Email not verified");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          role: user.role?.slug || "user", // Store role as a string (fallback to "user" if null)
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        username: token.username as string,
        role: token.role as string, // Ensure role is a string
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role; // Ensure role is stored as a string
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
