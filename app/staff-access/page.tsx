"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffAccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#000" }} />
  );
}
