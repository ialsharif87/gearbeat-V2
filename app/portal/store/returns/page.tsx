import T from "@/components/t";

export default function VendorReturnsPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Returns" ar="الإرجاعات" />
        </span>
        <h1>
          <T en="Returns" ar="الإرجاعات" />
        </h1>
        <p>
          <T
            en="Returns management coming soon."
            ar="إدارة الإرجاعات قريباً."
          />
        </p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Coming Soon" ar="قريبًا" />
        </h2>
        <p>
          <T
            en="We are working on a unified returns management system for vendors."
            ar="نحن نعمل على نظام موحد لإدارة المرتجعات للتجار."
          />
        </p>
      </div>
    </div>
  );
}
