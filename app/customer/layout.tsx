import { requireCompleteProfile } from "../../lib/profile-completion";

export default async function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireCompleteProfile();

  return <>{children}</>;
}
