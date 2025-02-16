"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role; // Assuming 'role' exists in session

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Menu</h2>

      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard" className="p-2 hover:bg-gray-700 rounded">
          Dashboard
        </Link>
        <Link href="/expenses/new" className="p-2 hover:bg-gray-700 rounded">
          Add Expense
        </Link>

        {role === "ADMIN" && (
          <>
            <Link href="/users" className="p-2 hover:bg-gray-700 rounded">
              Manage Users
            </Link>
            <Link href="/reports" className="p-2 hover:bg-gray-700 rounded">
              Reports
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
