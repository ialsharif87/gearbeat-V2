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
    { href: "/portal/studio/contract", icon: "📜", label: "Contract & Activation", label_ar: "العقد والتفعيل" },
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
    <aside className="portal-sidebar" style={{ background: "var(--gb-bg)", borderInlineEnd: "1px solid var(--gb-border)", width: '280px', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="portal-sidebar-head" style={{ padding: '32px 24px' }}>
        <Link href="/" className="portal-logo" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          GearBeat
          <span className="gb-dash-badge" style={{ 
            fontSize: '0.6rem', 
            padding: '2px 8px',
            background: isOwner ? 'rgba(15, 160, 138, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            color: isOwner ? 'var(--gb-teal)' : 'var(--gb-gold)',
            border: isOwner ? '1px solid var(--gb-teal)' : '1px solid var(--gb-gold)'
          }}>
            {isOwner ? <T en="Studio" ar="استوديو" /> : <T en="Vendor" ar="تاجر" />}
          </span>
        </Link>
      </div>

      <nav className="portal-nav" style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isActive ? "active" : ""}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--gb-gold)' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isActive ? '1px solid rgba(212, 175, 55, 0.1)' : '1px solid transparent',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500
              }}
            >
              <span className="icon" style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              <span className="label">
                <T en={item.label} ar={item.label_ar || item.label} />
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="portal-sidebar-footer" style={{ padding: '24px', borderTop: '1px solid var(--gb-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="portal-lang-toggle" style={{ 
          display: "flex", 
          alignItems: 'center',
          gap: '8px', 
          fontSize: "0.8rem",
          fontWeight: 800,
          background: 'rgba(255,255,255,0.03)',
          padding: '8px',
          borderRadius: '10px',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => toggleLanguage("ar")}
            style={{ 
              background: currentLang === "ar" ? "var(--gb-gold)" : "transparent", 
              border: "none", 
              cursor: "pointer", 
              color: currentLang === "ar" ? "black" : "rgba(255,255,255,0.4)",
              padding: '4px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            AR
          </button>
          <button 
            onClick={() => toggleLanguage("en")}
            style={{ 
              background: currentLang === "en" ? "var(--gb-gold)" : "transparent", 
              border: "none", 
              cursor: "pointer", 
              color: currentLang === "en" ? "black" : "rgba(255,255,255,0.4)",
              padding: '4px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            EN
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <PortalNotificationBell />
          <Link href="/help" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <T en="Help" ar="المساعدة" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="gb-button gb-button-outline"
          style={{
            width: "100%",
            justifyContent: 'center',
            height: '42px',
            fontSize: '0.85rem',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          <span className="icon" style={{ marginRight: '8px' }}>🚪</span>
          <T en="Logout" ar="خروج" />
        </button>
      </div>
    </aside>
  );
}
