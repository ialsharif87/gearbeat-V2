import { requireCompleteProfile } from "../../lib/profile-completion";

export default async function OwnerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireCompleteProfile();

  return <>{children}</>;
}
