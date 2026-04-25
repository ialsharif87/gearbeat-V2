import { requireCompleteProfile } from "../../../../lib/profile-completion";

export default async function StudioBookingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireCompleteProfile();

  return <>{children}</>;
}
