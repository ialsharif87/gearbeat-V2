import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | GearBeat",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
