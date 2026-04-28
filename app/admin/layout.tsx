import type { ReactNode } from "react";
import { requireAdminLayoutAccess } from "../../lib/route-guards";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAdminLayoutAccess();

  return <>{children}</>;
}
