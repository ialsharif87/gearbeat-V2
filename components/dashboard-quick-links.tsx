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
    <section className="gb-card">
      <div className="gb-card-header">
        <div>
          {eyebrow ? <p className="gb-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className="gb-muted-text">{description}</p> : null}
        </div>
      </div>

      <div className="gb-card-grid">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="gb-card">
            <h3>{link.label}</h3>
            {link.description ? (
              <p className="gb-muted-text">{link.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
