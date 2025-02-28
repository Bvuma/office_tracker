"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();
  // Default to "staff" if no role is provided.
  const userRole = session?.user?.role || "staff";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define your navigation items with their allowed roles.
  const navItems = [
    { label: "Dashboard", href: "/dashboard", roles: ["staff", "admin"] },
    { label: "Customers", href: "/customers", roles: ["staff", "admin"] },
    { label: "Purchases", href: "/purchases", roles: ["staff", "admin"] },
    { label: "Expenses", href: "/expenses", roles: ["staff", "admin"] },
    { label: "Sales", href: "/sales", roles: ["staff", "admin"] },
    { label: "Tenders", href: "/tenders", roles: ["staff", "admin"] },
    { label: "Sale Purchases", href: "/salePurchases", roles: ["staff", "admin"] },
    { label: "Suppliers", href: "/suppliers", roles: ["staff", "admin"] },
    { label: "Users", href: "/users", roles: ["admin"] },
    { label: "Roles", href: "/roles", roles: ["admin"] },
  ];

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 text-white p-4">
        <div className="text-xl font-bold">My System</div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-gray-700 text-white p-4">
          <nav>
            <ul>
              {navItems.map((item, idx) =>
                item.roles.includes(userRole) ? (
                  <li key={idx} className="mb-3">
                    <Link href={item.href}>
                      <a
                        onClick={() => setMobileOpen(false)}
                        className="block hover:underline"
                      >
                        {item.label}
                      </a>
                    </Link>
                  </li>
                ) : null
              )}
              <li className="mt-4">
                <button onClick={() => signOut()} className="hover:underline">
                  Sign Out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:h-screen md:bg-gray-800 md:text-white md:p-4">
        <div className="text-2xl font-bold mb-8">My System</div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item, idx) =>
              item.roles.includes(userRole) ? (
                <li key={idx} className="mb-4">
                  <Link href={item.href}>
                    <a className="block hover:bg-gray-700 p-2 rounded">
                      {item.label}
                    </a>
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full text-left p-2 hover:bg-gray-700 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
