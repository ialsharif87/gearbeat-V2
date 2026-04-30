import { requireVendorLayoutAccess } from "../../lib/route-guards";
import T from "../../components/t";
import Link from "next/link";

export default async function VendorDashboard() {
  const { profile, vendorProfile } = await requireVendorLayoutAccess();

  // In a real scenario, we would fetch stats from the DB
  const stats = [
    { label_en: "Total Sales", label_ar: "إجمالي المبيعات", value: "0.00 SAR", icon: "💰" },
    { label_en: "Active Products", label_ar: "المنتجات النشطة", value: "0", icon: "📦" },
    { label_en: "Pending Orders", label_ar: "طلبات معلقة", value: "0", icon: "🧾" },
    { label_en: "Low Stock", label_ar: "مخزون منخفض", value: "0", icon: "⚠️" },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge badge-gold">
            <T en="Vendor Dashboard" ar="لوحة التاجر" />
          </span>
          <h1>
            <T en="Welcome back," ar="أهلاً بك مجدداً،" /> {profile?.full_name?.split(' ')[0]}
          </h1>
          <p>
            <T 
              en="Track your sales, manage inventory, and grow your audio gear business." 
              ar="تتبع مبيعاتك، أدر مخزونك، وطوّر تجارتك في عالم المعدات الصوتية." 
            />
          </p>
        </div>
      </div>

      {vendorProfile.status === 'pending' && (
        <div className="card profile-warning-box" style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>⏳</span>
            <div>
              <h3><T en="Account Under Review" ar="الحساب قيد المراجعة" /></h3>
              <p>
                <T 
                  en="Your vendor application is currently being reviewed by our team. You can start adding products, but they won't be public until approval." 
                  ar="طلب انضمامك كتاجر قيد المراجعة حالياً. يمكنك البدء بإضافة المنتجات، ولكن لن يتم عرضها للجمهور حتى يتم الاعتماد." 
                />
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <label><T en={stat.label_en} ar={stat.label_ar} /></label>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="card-head">
            <h3><T en="Quick Actions" ar="إجراءات سريعة" /></h3>
          </div>
          <div className="action-buttons-list" style={{ display: 'grid', gap: 12, marginTop: 15 }}>
            <Link href="/vendor/products/new" className="btn btn-primary w-full">
              <T en="+ Add New Product" ar="+ إضافة منتج جديد" />
            </Link>
            <Link href="/vendor/inventory" className="btn btn-secondary w-full">
              <T en="Update Inventory" ar="تحديث المخزون" />
            </Link>
            <Link href="/vendor/finance" className="btn btn-secondary w-full">
              <T en="View Finance Report" ar="عرض التقارير المالية" />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3><T en="Recent Orders" ar="أحدث الطلبات" /></h3>
          </div>
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--muted)' }}>
              <T en="No orders found yet." ar="لا توجد طلبات بعد." />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
