import T from "@/components/t";

export default function VendorInventoryPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Inventory" ar="المخزون" />
        </span>
        <h1>
          <T en="Inventory Management" ar="إدارة المخزون" />
        </h1>
        <p>
          <T
            en="Track product stock levels, low-stock items, and inventory updates."
            ar="تابع كميات المنتجات، والتنبيهات الخاصة بنقص المخزون، وتحديثات المخزون."
          />
        </p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Coming Soon" ar="قريبًا" />
        </h2>
        <p>
          <T
            en="Inventory controls will be connected after the product and order foundations are completed."
            ar="سيتم ربط أدوات المخزون بعد الانتهاء من أساس المنتجات والطلبات."
          />
        </p>
      </div>
    </div>
  );
}
