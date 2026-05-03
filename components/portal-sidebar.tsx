"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import T from "./t";
import PortalNotificationBell from "./portal-notification-bell";

type PortalSidebarProps = {
  role: "owner" | "studio_owner" | "vendor";
};

export default function PortalSidebar({ role }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const toggleLanguage = (lang: string) => {
    document.cookie = `gb_lang=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const currentLang = typeof document !== "undefined" 
    ? document.cookie.split('; ').find(row => row.startsWith('gb_lang='))?.split('=')[1] || 'ar'
    : 'ar';

  const isOwner = role === "owner" || role === "studio_owner";

  const ownerItems = [
    { href: "/portal/studio", icon: "📊", label: "Dashboard", label_ar: "لوحة التحكم" },
    { href: "/portal/studio/studios", icon: "🎙️", label: "My Studios", label_ar: "استوديوهاتي" },
    { href: "/portal/studio/bookings", icon: "📅", label: "Bookings", label_ar: "الحجوزات" },
    { href: "/portal/studio/analytics", icon: "📊", label: "Analytics", label_ar: "التحليلات" },
    { href: "/portal/studio/availability", icon: "🕐", label: "Availability", label_ar: "الأوقات المتاحة" },
    { href: "/portal/studio/reviews", icon: "⭐", label: "Reviews", label_ar: "التقييمات" },
    { href: "/portal/studio/payouts", icon: "💰", label: "Payouts", label_ar: "المستحقات" },
    { href: "/portal/studio/boost", icon: "🚀", label: "Boost & Visibility", label_ar: "تعزيز الظهور" },
    { href: "/portal/studio/settings", icon: "⚙️", label: "Settings", label_ar: "الإعدادات" },
  ];

  const vendorItems = [
    { href: "/portal/store", icon: "📊", label: "Dashboard", label_ar: "لوحة التحكم" },
    { href: "/portal/store/products", icon: "📦", label: "Products", label_ar: "المنتجات" },
    { href: "/portal/store/orders", icon: "🧾", label: "Orders", label_ar: "الطلبات" },
    { href: "/portal/store/analytics", icon: "📊", label: "Analytics", label_ar: "التحليلات" },
    { href: "/portal/store/inventory", icon: "🏭", label: "Inventory", label_ar: "المخزون" },
    { href: "/portal/store/returns", icon: "↩️", label: "Returns", label_ar: "الإرجاعات" },
    { href: "/portal/store/payouts", icon: "💰", label: "Payouts", label_ar: "المستحقات" },
    { href: "/portal/store/settings", icon: "⚙️", label: "Settings", label_ar: "الإعدادات" },
  ];

  const menuItems = isOwner ? ownerItems : vendorItems;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <aside className="portal-sidebar" style={{ background: "#0d0d0d", borderRight: "1px solid #1a1a1a" }}>
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
                <T en={item.label} ar={item.label_ar || item.label} />
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="portal-sidebar-footer">
        <div className="portal-lang-toggle" style={{ 
          display: "flex", 
          gap: 10, 
          padding: "0 16px 16px",
          fontSize: "0.85rem",
          fontWeight: 700
        }}>
          <button 
            onClick={() => toggleLanguage("ar")}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: currentLang === "ar" ? "var(--gb-gold)" : "var(--gb-muted)",
              padding: 0
            }}
          >
            AR
          </button>
          <span style={{ color: "var(--gb-border)" }}>|</span>
          <button 
            onClick={() => toggleLanguage("en")}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: currentLang === "en" ? "var(--gb-gold)" : "var(--gb-muted)",
              padding: 0
            }}
          >
            EN
          </button>
        </div>

        <PortalNotificationBell />
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
