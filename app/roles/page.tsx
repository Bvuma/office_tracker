// app/roles/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RolesPage from "./RolesPage";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return <p>Unauthorized</p>;
  }

  return <RolesPage />;
}
