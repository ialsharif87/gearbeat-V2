"use client";

import Link from "next/link";

export default function MarketplaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="dashboard-page"
      style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 20px" }}
    >
      <div
        className="card"
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(212,175,55,0.05), rgba(0,0,0,0))",
          border: "1px dashed rgba(212,175,55,0.2)",
          borderRadius: 24,
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: 24 }}>🛡️</div>

        <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--gb-gold)" }}>
          Marketplace is being prepared for pilot launch
        </h2>

        <p
          style={{
            color: "var(--gb-steel)",
            marginBottom: "1rem",
            maxWidth: 680,
            marginInline: "auto",
            lineHeight: 1.7,
          }}
        >
          We are preparing GearBeat Marketplace products and operations for a controlled pilot experience.
          Please check back soon.
        </p>

        <p
          dir="rtl"
          style={{
            color: "var(--gb-steel)",
            marginBottom: "2.5rem",
            maxWidth: 680,
            marginInline: "auto",
            lineHeight: 1.8,
          }}
        >
          المتجر قيد التجهيز للمرحلة التجريبية. نعمل على تجهيز منتجات وتجربة GearBeat Marketplace بشكل منظم وآمن.
          يرجى العودة قريبًا.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={reset} className="btn btn-outline">
            Try again
          </button>

          <Link href="/join/seller" className="btn btn-primary">
            Join as Seller
          </Link>
        </div>
      </div>
    </main>
  );
}
