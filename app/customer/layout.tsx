import type { ReactNode } from "react";
import { requireCustomerLayoutAccess } from "../../lib/route-guards";

export default async function CustomerLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireCustomerLayoutAccess();

  return <>{children}</>;
}
