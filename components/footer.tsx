import Link from "next/link";
import T from "./t";

const footerColumns = [
  {
    titleEn: "Explore",
    titleAr: "استكشف",
    links: [
      { href: "/studios", en: "Browse studios", ar: "تصفح الاستوديوهات" },
      { href: "/marketplace", en: "Marketplace", ar: "السوق" },
      { href: "/about", en: "About GearBeat", ar: "من نحن" },
      { href: "/support", en: "Support", ar: "الدعم" },
    ],
  },
  {
    titleEn: "For Studios",
    titleAr: "لأصحاب الاستوديوهات",
    links: [
      { href: "/signup", en: "List your studio", ar: "أضف استوديوك" },
      { href: "/owner", en: "Owner dashboard", ar: "لوحة المالك" },
      { href: "/support", en: "Partner support", ar: "دعم الشركاء" },
    ],
  },
  {
    titleEn: "Account",
    titleAr: "الحساب",
    links: [
      { href: "/login", en: "Login", ar: "تسجيل الدخول" },
      { href: "/signup", en: "Create account", ar: "إنشاء حساب" },
      { href: "/customer", en: "Customer dashboard", ar: "لوحة العميل" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gb-footer">
      <div className="gb-footer-shell">
        <div className="gb-footer-top">
          <div className="gb-footer-brand">
            <Link href="/" aria-label="GearBeat Home" className="gb-footer-logo-link">
              <img
                src="/brand/logo-horizontal-ai.png"
                alt="GearBeat"
                className="gb-footer-logo"
              />
            </Link>

            <p className="gb-footer-description">
              <T
                en="GearBeat connects creators with premium music, podcast, and audio studios across Saudi Arabia and the GCC."
                ar="جيربيت تربط المبدعين بأفضل الاستوديوهات الموسيقية والصوتية والبودكاست في السعودية والخليج."
              />
            </p>

            <div className="gb-footer-badges">
              <span>
                <T en="Verified Studios" ar="استوديوهات موثقة" />
              </span>
              <span>
                <T en="Sound First" ar="الصوت أولًا" />
              </span>
              <span>
                <T en="GCC Ready" ar="جاهز للخليج" />
              </span>
            </div>
          </div>

          <div className="gb-footer-columns">
            {footerColumns.map((column) => (
              <div className="gb-footer-column" key={column.titleEn}>
                <h3>
                  <T en={column.titleEn} ar={column.titleAr} />
                </h3>

                <ul>
                  {column.links.map((link) => (
                    <li key={link.href + link.en}>
                      <Link href={link.href}>
                        <T en={link.en} ar={link.ar} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="gb-footer-middle">
          <div className="gb-footer-card">
            <img
              src="/brand/logo-mark-ai.png"
              alt=""
              className="gb-footer-mark"
            />

            <div>
              <strong>
                <T en="STUDIO. SOUND. CONNECTED." ar="استوديو. صوت. اتصال." />
              </strong>
              <p>
                <T
                  en="A premium marketplace experience designed for creators and studio owners."
                  ar="تجربة سوق فاخرة مصممة للمبدعين وأصحاب الاستوديوهات."
                />
              </p>
            </div>
          </div>

          <div className="gb-footer-cta">
            <Link href="/studios" className="gb-footer-primary-button">
              <T en="Browse studios" ar="تصفح الاستوديوهات" />
            </Link>

            <Link href="/signup" className="gb-footer-ghost-button">
              <T en="List your studio" ar="أضف استوديوك" />
            </Link>
          </div>
        </div>

        <div className="gb-footer-bottom">
          <p>
            © {currentYear} GearBeat.{" "}
            <T en="All rights reserved." ar="جميع الحقوق محفوظة." />
          </p>

          <div className="gb-footer-legal">
            <Link href="/support">
              <T en="Help" ar="المساعدة" />
            </Link>
            <Link href="/about">
              <T en="Company" ar="الشركة" />
            </Link>
            <Link href="/studios">
              <T en="Studios" ar="الاستوديوهات" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
