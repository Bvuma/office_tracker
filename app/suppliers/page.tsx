// app/suppliers/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SuppliersPage from "./SuppliersPage";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Unauthorized</p>;
  }

  return <SuppliersPage />;
}
