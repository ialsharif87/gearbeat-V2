import Link from "next/link";
import { requireAdminRole } from "../../lib/admin";
import T from "../../components/t";
import DashboardQuickLinks from "../../components/dashboard-quick-links";
import { adminDashboardLinks } from "../../lib/dashboard-links";

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "operations") return "Operations";
  if (role === "support") return "Support";
  if (role === "content") return "Content";
  if (role === "sales") return "Sales";
  if (role === "finance") return "Finance";
  return role || "Admin";
}

export default async function AdminDashboardPage() {
  const { admin, user } = await requireAdminRole([
    "super_admin",
    "operations",
    "support",
    "content",
    "sales",
    "finance"
  ]);

  const isSuperAdmin = admin.admin_role === "super_admin";

  const canManageStudios =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "content";

  const canManageOwnerCompliance =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support";

  const canManageBookings =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support" ||
    admin.admin_role === "sales" ||
    admin.admin_role === "finance";

  const canManageReviews =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support" ||
    admin.admin_role === "content";

  const canManageFinance =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "finance";

  const canViewAudit =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations";

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Admin Dashboard" ar="لوحة الإدارة" />
          </p>

          <h1>
            <T en="GearBeat Control Center" ar="مركز تحكم GearBeat" />
          </h1>

          <p className="gb-muted-text">
            <T
              en="Manage studios, bookings, reviews, owner onboarding, finance, payouts, and internal operations."
              ar="إدارة الاستوديوهات، الحجوزات، التقييمات، إعداد الملاك، المالية، وعمليات المنصة."
            />
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/admin/finance" className="gb-button">
            Finance center
          </Link>
          <Link href="/admin/audit-log" className="gb-button gb-button-secondary">
            Audit log
          </Link>
        </div>
      </section>

      <div className="gb-dashboard-stack">
        <DashboardQuickLinks
          eyebrow="Admin navigation"
          title="Admin quick links"
          description="Access core GearBeat admin tools from one clean dashboard."
          links={adminDashboardLinks}
        />

      <div className="card admin-notes-card">
        <span className="badge">
          <T en="Current Access" ar="صلاحية الدخول الحالية" />
        </span>

        <h2>{roleLabel(admin.admin_role)}</h2>

        <div className="admin-notes-meta">
          <p>
            <strong>
              <T en="Email:" ar="البريد الإلكتروني:" />
            </strong>{" "}
            {user?.email || admin.email || "—"}
          </p>

          <p>
            <strong>
              <T en="Role:" ar="الدور:" />
            </strong>{" "}
            {roleLabel(admin.admin_role)}
          </p>

          <p>
            <strong>
              <T en="Status:" ar="الحالة:" />
            </strong>{" "}
            {admin.status || "active"}
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Studios" ar="الاستوديوهات" />
          </span>
          <strong>OPS</strong>
          <p className="admin-muted-line">
            <T
              en="Monitor listings, approval, verification, and ownership."
              ar="مراقبة القوائم، الاعتماد، التوثيق، والملكية."
            />
          </p>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Bookings" ar="الحجوزات" />
          </span>
          <strong>LIVE</strong>
          <p className="admin-muted-line">
            <T
              en="Review booking status, customers, studios, and operations."
              ar="مراجعة حالة الحجوزات، العملاء، الاستوديوهات، والعمليات."
            />
          </p>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Compliance" ar="الامتثال" />
          </span>
          <strong>NEW</strong>
          <p className="admin-muted-line">
            <T
              en="Approve owners after business documents and agreements."
              ar="اعتماد الملاك بعد بيانات الشركة والوثائق والعقود."
            />
          </p>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Finance" ar="المالية" />
          </span>
          <strong>READY</strong>
          <p className="admin-muted-line">
            <T
              en="Monitor studio payments, owner bank accounts, settlements, and payouts."
              ar="مراقبة مدفوعات الاستوديو، الحسابات البنكية، التسويات، والبياوت."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Core Operations" ar="العمليات الأساسية" />
          </span>

          <h2>
            <T en="Platform management" ar="إدارة المنصة" />
          </h2>

          <div className="admin-role-list">
            {canManageStudios ? (
              <div>
                <strong>
                  <T en="Studios Monitoring" ar="مراقبة الاستوديوهات" />
                </strong>

                <p>
                  <T
                    en="Approve, suspend, verify, and review studio ownership."
                    ar="اعتماد، إيقاف، توثيق، ومراجعة ملكية الاستوديوهات."
                  />
                </p>

                <div className="actions">
                  <Link href="/admin/studios" className="btn btn-secondary">
                    <T en="Open Studios" ar="فتح الاستوديوهات" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canManageOwnerCompliance ? (
              <div>
                <strong>
                  <T en="Owner Compliance" ar="امتثال ملاك الاستوديوهات" />
                </strong>

                <p>
                  <T
                    en="Review commercial registration, national address, zakat certificate, finance details, and electronic agreement."
                    ar="مراجعة السجل التجاري، العنوان الوطني، شهادة الزكاة، البيانات المالية، والعقد الإلكتروني."
                  />
                </p>

                <div className="actions">
                  <Link
                    href="/admin/owner-compliance"
                    className="btn btn-secondary"
                  >
                    <T en="Open Owner Compliance" ar="فتح امتثال الملاك" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canManageBookings ? (
              <div>
                <strong>
                  <T en="Bookings" ar="الحجوزات" />
                </strong>

                <p>
                  <T
                    en="Monitor booking activity, booking status, customer records, payment status, and studio reservations."
                    ar="مراقبة نشاط الحجوزات، حالة الحجز، سجلات العملاء، حالة الدفع، وحجوزات الاستوديوهات."
                  />
                </p>

                <div className="actions">
                  <Link href="/admin/bookings" className="btn btn-secondary">
                    <T en="Open Bookings" ar="فتح الحجوزات" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canManageReviews ? (
              <div>
                <strong>
                  <T en="Reviews" ar="التقييمات" />
                </strong>

                <p>
                  <T
                    en="Review, publish, hide, and monitor verified booking reviews."
                    ar="مراجعة، نشر، إخفاء، ومراقبة تقييمات الحجوزات الموثقة."
                  />
                </p>

                <div className="actions">
                  <Link href="/admin/reviews" className="btn btn-secondary">
                    <T en="Open Reviews" ar="فتح التقييمات" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canManageStudios ? (
              <>
                <div>
                  <strong>
                    <T en="Marketplace & Vendors" ar="السوق والتجار" />
                  </strong>

                  <p>
                    <T
                      en="Review and approve gear vendor applications, manage vendor compliance, and marketplace products."
                      ar="مراجعة واعتماد طلبات تجار المعدات، إدارة امتثال التجار، ومنتجات السوق."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/vendors" className="btn btn-secondary">
                      <T en="Manage Vendors" ar="إدارة التجار" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Commission Settings" ar="إعدادات العمولة" />
                  </strong>

                  <p>
                    <T
                      en="Manage global commission percentage (10% to 30%) and set custom rates per studio."
                      ar="إدارة نسبة العمولة العامة (10٪ إلى 30٪) وتحديد نسب مخصصة لكل استوديو."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/commission-settings" className="btn btn-secondary">
                      <T en="Manage Commissions" ar="إدارة العمولات" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Acceleration Requests" ar="طلبات التسريع" />
                  </strong>

                  <p>
                    <T
                      en="Review, approve, and manage studio visibility acceleration requests."
                      ar="مراجعة واعتماد وإدارة طلبات تسريع ظهور الاستوديوهات."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/acceleration" className="btn btn-secondary">
                      <T en="Manage Acceleration" ar="إدارة التسريع" />
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Finance Center" ar="مركز المالية" />
          </span>

          <h2>
            <T en="Payments, settlements, and payouts" ar="المدفوعات، التسويات، والبياوت" />
          </h2>

          <div className="admin-role-list">
            {canManageFinance ? (
              <>
                <div>
                  <strong>
                    <T en="Owner Bank Accounts" ar="حسابات الملاك البنكية" />
                  </strong>

                  <p>
                    <T
                      en="Review and approve owner bank accounts before payouts can be sent."
                      ar="مراجعة واعتماد الحسابات البنكية للملاك قبل إرسال البياوت."
                    />
                  </p>

                  <div className="actions">
                    <Link
                      href="/admin/owner-bank-accounts"
                      className="btn btn-secondary"
                    >
                      <T en="Open Bank Accounts" ar="فتح الحسابات البنكية" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Studio Payments" ar="مدفوعات الاستوديو" />
                  </strong>

                  <p>
                    <T
                      en="Monitor paid bookings, create payment records, and create settlements for completed studio bookings."
                      ar="مراقبة الحجوزات المدفوعة، إنشاء سجلات الدفع، وإنشاء التسويات لحجوزات الاستوديو المكتملة."
                    />
                  </p>

                  <div className="actions">
                    <Link
                      href="/admin/studio-payments"
                      className="btn btn-secondary"
                    >
                      <T en="Open Studio Payments" ar="فتح مدفوعات الاستوديو" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Studio Payouts" ar="بياوت الاستوديو" />
                  </strong>

                  <p>
                    <T
                      en="Create payouts from eligible settlements, approve payouts, mark them as paid, or handle failed transfers."
                      ar="إنشاء البياوت من التسويات المؤهلة، اعتماد البياوت، تحديده كمدفوع، أو معالجة التحويلات الفاشلة."
                    />
                  </p>

                  <div className="actions">
                    <Link
                      href="/admin/studio-payouts"
                      className="btn btn-secondary"
                    >
                      <T en="Open Studio Payouts" ar="فتح بياوت الاستوديو" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Finance Control Center" ar="مركز التحكم المالي" />
                  </strong>

                  <p>
                    <T
                      en="High-level financial monitoring of GMV, commissions, and payable balances across all sources."
                      ar="مراقبة مالية عالية المستوى لإجمالي المبيعات والعمولات والأرصدة المستحقة عبر جميع المصادر."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/finance" className="btn btn-primary">
                      <T en="Open Finance Center" ar="فتح مركز المالية" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Internal Finance Ledger" ar="سجل المالية الداخلي" />
                  </strong>

                  <p>
                    <T
                      en="Accounting foundation for payments, commissions, and payables."
                      ar="الأساس المحاسبي للمدفوعات والعمولات والمبالغ المستحقة."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/finance-ledger" className="btn btn-secondary">
                      <T en="Open Finance Ledger" ar="فتح سجل المالية" />
                    </Link>
                    <Link href="/admin/refunds" className="btn btn-primary">
                      <T en="Open Refunds" ar="فتح المرتجعات" />
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>
                    <T en="Payouts & Settlements" ar="التسويات والبياوت" />
                  </strong>

                  <p>
                    <T
                      en="View consolidated revenue reports, GearBeat commissions, and net payable amounts across all sources."
                      ar="عرض تقارير الإيرادات المجمعة، عمولات GearBeat، والمبالغ المستحقة عبر جميع المصادر."
                    />
                  </p>

                  <div className="actions">
                    <Link href="/admin/payouts" className="btn btn-secondary">
                      <T en="Open Payouts Report" ar="فتح تقرير البياوت" />
                    </Link>
                    <Link href="/admin/settlements" className="btn btn-primary">
                      <T en="Open Settlements" ar="فتح التسويات" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <strong>
                  <T en="Finance access restricted" ar="الدخول المالي محدود" />
                </strong>

                <p>
                  <T
                    en="Your current admin role does not have access to finance tools."
                    ar="صلاحيتك الحالية لا تملك دخولًا إلى أدوات المالية."
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Admin Tools" ar="أدوات الإدارة" />
          </span>

          <h2>
            <T en="Controls and governance" ar="التحكم والحوكمة" />
          </h2>

          <div className="admin-role-list">
            {isSuperAdmin ? (
              <div>
                <strong>
                  <T en="Admin Team" ar="فريق الإدارة" />
                </strong>

                <p>
                  <T
                    en="Manage internal team access, roles, and admin permissions."
                    ar="إدارة دخول الفريق الداخلي، الأدوار، وصلاحيات الإدارة."
                  />
                </p>

                <div className="actions">
                  <Link href="/admin/team" className="btn btn-secondary">
                    <T en="Open Admin Team" ar="فتح فريق الإدارة" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canManageOwnerCompliance ? (
              <div>
                <strong>
                  <T en="Account Deletion Requests" ar="طلبات حذف الحسابات" />
                </strong>

                <p>
                  <T
                    en="Review and execute account deletion or anonymization requests."
                    ar="مراجعة وتنفيذ طلبات حذف الحساب أو إخفاء البيانات."
                  />
                </p>

                <div className="actions">
                  <Link
                    href="/admin/account-deletion-requests"
                    className="btn btn-secondary"
                  >
                    <T en="Open Deletion Requests" ar="فتح طلبات الحذف" />
                  </Link>
                </div>
              </div>
            ) : null}

            {canViewAudit ? (
              <div>
                <strong>
                  <T en="Audit Log" ar="سجل التدقيق" />
                </strong>

                <p>
                  <T
                    en="Track important admin actions and sensitive account changes."
                    ar="تتبع إجراءات الإدارة المهمة وتغييرات الحسابات الحساسة."
                  />
                </p>

                <div className="actions">
                  <Link href="/admin/audit-log" className="btn btn-secondary">
                    <T en="Open Audit Log" ar="فتح سجل التدقيق" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Public Site" ar="الموقع العام" />
          </span>

          <h2>
            <T en="Website navigation" ar="التنقل في الموقع" />
          </h2>

          <p>
            <T
              en="Return to the public GearBeat website or browse the public studio listings."
              ar="العودة إلى موقع GearBeat العام أو تصفح قوائم الاستوديوهات العامة."
            />
          </p>

          <div className="actions">
            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>

            <Link href="/studios" className="btn btn-secondary">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Recommended Workflow" ar="مسار العمل المقترح" />
        </span>

        <h2>
          <T
            en="How studio activation and finance should work"
            ar="كيف يجب أن يتم تفعيل الاستوديو والمالية"
          />
        </h2>

        <div className="feature-list">
          <div className="feature-row">
            <div>
              <strong>
                <T en="1. Owner signs up" ar="١. المالك ينشئ حساب" />
              </strong>
              <p>
                <T
                  en="Studio owner creates an owner account from the normal signup page."
                  ar="مالك الاستوديو ينشئ حساب مالك من صفحة التسجيل العادية."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T
                  en="2. Owner completes onboarding"
                  ar="٢. المالك يكمل بياناته"
                />
              </strong>
              <p>
                <T
                  en="Company details, commercial registration, national address, zakat certificate, invoice information, agreement, and bank account are completed."
                  ar="يتم إكمال بيانات الشركة، السجل التجاري، العنوان الوطني، شهادة الزكاة، بيانات الفوترة، العقد، والحساب البنكي."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T
                  en="3. Admin approves compliance and bank account"
                  ar="٣. الإدارة تعتمد الامتثال والحساب البنكي"
                />
              </strong>
              <p>
                <T
                  en="Admin reviews the owner compliance profile and bank account before payouts are enabled."
                  ar="الإدارة تراجع ملف امتثال المالك والحساب البنكي قبل تفعيل البياوت."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T
                  en="4. Customer books and pays"
                  ar="٤. العميل يحجز ويدفع"
                />
              </strong>
              <p>
                <T
                  en="Owner confirms the booking, customer pays GearBeat, and the payment is recorded in the finance system."
                  ar="المالك يؤكد الحجز، العميل يدفع لـ GearBeat، ويتم تسجيل الدفع في النظام المالي."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T
                  en="5. Admin settles and pays out"
                  ar="٥. الإدارة تنشئ التسوية والبياوت"
                />
              </strong>
              <p>
                <T
                  en="After completion, finance creates settlement, creates payout, approves it, and marks it as paid."
                  ar="بعد اكتمال الحجز، المالية تنشئ التسوية، تنشئ البياوت، تعتمده، وتحدده كمدفوع."
                />
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
