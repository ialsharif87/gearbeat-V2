import T from "@/components/t";

export default function VendorBankPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Bank Account" ar="الحساب البنكي" />
        </span>
        <h1>
          <T en="Payout Bank Account" ar="الحساب البنكي للتحويلات" />
        </h1>
        <p>
          <T
            en="Manage the bank account used for vendor payouts."
            ar="إدارة الحساب البنكي المستخدم لتحويل مستحقات التاجر."
          />
        </p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Coming Soon" ar="قريبًا" />
        </h2>
        <p>
          <T
            en="Bank account collection and verification will be added after the payout structure is finalized."
            ar="سيتم إضافة جمع بيانات الحساب البنكي والتحقق منها بعد تثبيت هيكل التحويلات."
          />
        </p>
      </div>
    </div>
  );
}
