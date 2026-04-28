import type { ReactNode } from "react";
import { requireOwnerLayoutAccess } from "../../lib/route-guards";

export default async function OwnerLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireOwnerLayoutAccess();

  return <>{children}</>;
}
