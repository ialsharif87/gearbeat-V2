import T from "@/components/t";

export default function VendorSettingsPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Settings" ar="الإعدادات" />
        </span>
        <h1>
          <T en="Vendor Settings" ar="إعدادات التاجر" />
        </h1>
        <p>
          <T
            en="Manage store information, account preferences, and vendor configuration."
            ar="إدارة معلومات المتجر، وتفضيلات الحساب، وإعدادات التاجر."
          />
        </p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Coming Soon" ar="قريبًا" />
        </h2>
        <p>
          <T
            en="Settings will be activated after the vendor profile and approval flow are finalized."
            ar="سيتم تفعيل الإعدادات بعد الانتهاء من ملف التاجر ومسار الموافقة."
          />
        </p>
      </div>
    </div>
  );
}
