import type { ReactNode } from "react";
import CustomerAccountNav from "../../components/customer-account-nav";
import { requireCustomerLayoutAccess } from "../../lib/route-guards";

export default async function CustomerLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireCustomerLayoutAccess();

  return (
    <>
      <CustomerAccountNav />
      {children}
    </>
  );
}
