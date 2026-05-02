"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import T from "./t";

type PortalSidebarProps = {
  role: "owner" | "studio_owner" | "vendor";
};

export default function PortalSidebar({ role }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isOwner = role === "owner" || role === "studio_owner";

  const ownerItems = [
    { href: "/portal/studio", icon: "📊", en: "Dashboard", ar: "لوحة التحكم" },
    { href: "/portal/studio/studios", icon: "🎙️", en: "My Studios", ar: "استوديوهاتي" },
    { href: "/portal/studio/bookings", icon: "📅", en: "Bookings", ar: "الحجوزات" },
    { href: "/portal/studio/availability", icon: "🕐", en: "Availability", ar: "الأوقات المتاحة" },
    { href: "/portal/studio/reviews", icon: "⭐", en: "Reviews", ar: "التقييمات" },
    { href: "/portal/studio/payouts", icon: "💰", en: "Payouts", ar: "المستحقات" },
    { href: "/portal/studio/boost", icon: "🚀", en: "Boost & Visibility", ar: "تعزيز الظهور" },
    { href: "/portal/studio/settings", icon: "⚙️", en: "Settings", ar: "الإعدادات" },
  ];

  const vendorItems = [
    { href: "/portal/store", icon: "📊", en: "Dashboard", ar: "لوحة التحكم" },
    { href: "/portal/store/products", icon: "📦", en: "Products", ar: "المنتجات" },
    { href: "/portal/store/orders", icon: "🧾", en: "Orders", ar: "الطلبات" },
    { href: "/portal/store/inventory", icon: "🏭", en: "Inventory", ar: "المخزون" },
    { href: "/portal/store/returns", icon: "↩️", en: "Returns", ar: "الإرجاعات" },
    { href: "/portal/store/payouts", icon: "💰", en: "Payouts", ar: "المستحقات" },
    { href: "/portal/store/settings", icon: "⚙️", en: "Settings", ar: "الإعدادات" },
  ];

  const menuItems = isOwner ? ownerItems : vendorItems;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-head">
        <Link href="/" className="portal-logo">
          GearBeat{" "}
          <span className={`badge ${isOwner ? "badge-blue" : "badge-gold"}`}>
            {isOwner ? (
              <T en="Studio" ar="استوديو" />
            ) : (
              <T en="Vendor" ar="تاجر" />
            )}
          </span>
        </Link>
      </div>

      <nav className="portal-nav">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isActive ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">
                <T en={item.en} ar={item.ar} />
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="portal-sidebar-footer">
        <Link href="/help" className="portal-nav-link">
          <span className="icon">❓</span>
          <span className="label">
            <T en="Help Center" ar="مركز المساعدة" />
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="portal-nav-link portal-logout-btn"
          style={{
            width: "100%",
            textAlign: "start",
            background: "none",
            border: "none",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          <span className="icon">🚪</span>
          <span className="label">
            <T en="Logout" ar="تسجيل الخروج" />
          </span>
        </button>
      </div>
    </aside>
  );
}
