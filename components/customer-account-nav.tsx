import Link from "next/link";
import T from "@/components/t";

const accountLinks = [
  { href: "/customer", en: "Dashboard", ar: "لوحة العميل" },
  { href: "/profile", en: "Profile", ar: "الملف الشخصي" },
  { href: "/customer/bookings", en: "Bookings", ar: "الحجوزات" },
  { href: "/customer/marketplace-orders", en: "Orders", ar: "الطلبات" },
  { href: "/customer/payments", en: "Payments", ar: "المدفوعات" },
  { href: "/customer/rewards", en: "Rewards", ar: "المكافآت" },
  { href: "/customer/saved", en: "Saved", ar: "المفضلة" },
];

export default function CustomerAccountNav() {
  return (
    <nav className="gb-account-nav" aria-label="Customer account navigation">
      <div className="gb-account-nav-inner">
        <span className="gb-account-nav-label">
          <T en="Account" ar="الحساب" />
        </span>

        <div className="gb-account-nav-links">
          {accountLinks.map((link) => (
            <Link key={link.href} href={link.href} className="gb-account-nav-link">
              <T en={link.en} ar={link.ar} />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
