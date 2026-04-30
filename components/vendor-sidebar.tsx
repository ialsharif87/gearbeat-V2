"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import T from "./t";

export default function VendorSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/vendor", label_en: "Dashboard", label_ar: "لوحة التحكم", icon: "📊" },
    { href: "/vendor/products", label_en: "Products", label_ar: "المنتجات", icon: "📦" },
    { href: "/vendor/inventory", label_en: "Inventory", label_ar: "المخزون", icon: "🏭" },
    { href: "/vendor/orders", label_en: "Orders", label_ar: "الطلبات", icon: "🧾" },
    { href: "/vendor/finance", label_en: "Finance", label_ar: "المالية", icon: "💰" },
    { href: "/vendor/bank", label_en: "Bank Account", label_ar: "الحساب البنكي", icon: "🏦" },
    { href: "/vendor/settings", label_en: "Settings", label_ar: "الإعدادات", icon: "⚙️" },
  ];

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-head">
        <Link href="/" className="portal-logo">
          GearBeat <span className="badge badge-gold">Vendor</span>
        </Link>
      </div>

      <nav className="portal-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isActive ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">
                <T en={item.label_en} ar={item.label_ar} />
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
      </div>
    </aside>
  );
}
