"use client";

import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-700">Dashboard</h1>
      <div className="flex items-center space-x-4">
        {session?.user && (
          <p className="text-gray-700">Welcome, {session.user.email}</p>
        )}
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
