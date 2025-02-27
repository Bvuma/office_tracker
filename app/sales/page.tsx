// app/sales/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SalesPage from "./SalesPage";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p>Unauthorized</p>;
  }
  return <SalesPage />;
}
