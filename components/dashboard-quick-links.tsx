"use client";

import Link from "next/link";
import T from "./t";

export type DashboardQuickLink = {
  href: string;
  label: string;
  label_ar?: string;
  icon?: string;
  description?: string;
};

type DashboardQuickLinksProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  links: DashboardQuickLink[];
};

export default function DashboardQuickLinks({
  links,
}: DashboardQuickLinksProps) {
  return (
    <div className="dashboard-quick-links-grid">
      {links.map((link) => (
        <Link 
          key={link.href} 
          href={link.href} 
          className="quick-link-card"
        >
          {link.icon && (
            <span className="quick-link-icon">{link.icon}</span>
          )}
          <span className="quick-link-label">
            <T en={link.label} ar={link.label_ar || link.label} />
          </span>
        </Link>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-quick-links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin: 20px 0;
        }

        @media (min-width: 768px) {
          .dashboard-quick-links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .quick-link-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          background: var(--gb-card, rgba(255,255,255,0.03));
          border: 1px solid var(--gb-border, rgba(255,255,255,0.1));
          border-radius: var(--radius, 16px);
          text-decoration: none;
          transition: all 0.2s ease;
          gap: 12px;
        }

        .quick-link-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--gb-gold);
          transform: translateY(-2px);
        }

        .quick-link-icon {
          font-size: 1.5rem;
          display: block;
        }

        .quick-link-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gb-cream-soft, #f8f4eb);
        }
      `}} />
    </div>
  );
}
