import Link from "next/link";

export type DashboardQuickLink = {
  href: string;
  label: string;
  description?: string;
};

type DashboardQuickLinksProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  links: DashboardQuickLink[];
};

export default function DashboardQuickLinks({
  eyebrow,
  title,
  description,
  links,
}: DashboardQuickLinksProps) {
  return (
    <section className="gb-card gb-dashboard-links-section">
      <div className="gb-card-header">
        <div>
          {eyebrow ? <p className="gb-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className="gb-muted-text">{description}</p> : null}
        </div>
      </div>

      <div className="gb-dashboard-links-grid">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="gb-dashboard-link-card"
          >
            <span className="gb-dashboard-link-title">{link.label}</span>
            {link.description ? (
              <span className="gb-dashboard-link-desc">
                {link.description}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
