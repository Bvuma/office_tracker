'use client'

import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session || session.user.role !== "admin") {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!isAuthorized) return null;

  return <h1>Admin Dashboard - Access Restricted</h1>;
}
