"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setForm({ email: "", password: "" }); // Clear form fields after successful login
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className={`w-full py-2 rounded-lg ${isLoading ? "bg-gray-400" : "bg-blue-600 text-white"}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <p className="text-sm mt-4 text-center">
          <Link href="/forgot-password" className="text-blue-600">
            Forgot Password?
          </Link>
        </p>

        {/* Signup Link */}
        <p className="text-sm mt-4 text-center">
  Don&apos;t have an account?{" "}
  <Link href="/signup" className="text-blue-600 font-medium">
    Create an account
  </Link>
</p>
      </div>
    </div>
  );
}
