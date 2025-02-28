// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();
  // Get the user role; default to "user" if not available.
  const userRole = session?.user?.role || "user";

  // Define your common menu items.
  const commonItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Customers", href: "/customers" },
    { label: "Purchases", href: "/purchases" },
    { label: "Expenses", href: "/expenses" },
    { label: "Sales", href: "/sales" },
    { label: "Tenders", href: "/tenders" },
    { label: "Suppliers", href: "/suppliers" },
    { label: "Sale Purchases", href: "/salePurchases" },
  ];

  // Define items that only admins should see.
  const adminItems = [
    { label: "Users", href: "/users" },
    { label: "Roles", href: "/roles" },
  ];

  // Merge menus based on role.
  const menuItems = userRole === "admin" ? [...adminItems, ...commonItems] : commonItems;

  // State to control the mobile menu toggle.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 text-white px-4 py-3">
        <div className="text-lg font-bold">My System</div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>
      {isMobileOpen && (
        <nav className="md:hidden bg-gray-800 text-white px-4 py-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className="block py-2 px-4 hover:bg-gray-700 rounded"
                onClick={() => setIsMobileOpen(false)}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 bg-gray-800 text-white min-h-screen p-4">
        <div className="text-2xl font-bold mb-8 text-center">My System</div>
        <nav>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="block py-2 px-4 hover:bg-gray-700 rounded">
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
