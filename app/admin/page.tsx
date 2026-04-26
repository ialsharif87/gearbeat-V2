import Link from "next/link";
import { requireAdminRole } from "../../lib/admin";
import T from "../../components/t";

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "operations") return "Operations";
  if (role === "support") return "Support";
  if (role === "content") return "Content";
  if (role === "sales") return "Sales";
  return role || "Admin";
}

export default async function AdminDashboardPage() {
  const { admin, user } = await requireAdminRole([
    "operations",
    "support",
    "content",
    "sales"
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
    admin.admin_role === "sales";

  const canManageReviews =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support" ||
    admin.admin_role === "content";

  const canViewAudit =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations";

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Dashboard" ar="لوحة الإدارة" />
        </span>

        <h1>
          <T en="GearBeat Control Center" ar="مركز تحكم GearBeat" />
        </h1>

        <p>
          <T
            en="Manage studios, bookings, reviews, owner onboarding, account deletion requests, and internal platform operations."
            ar="إدارة الاستوديوهات، الحجوزات، التقييمات، إعداد ملاك الاستوديوهات، طلبات حذف الحسابات، وعمليات المنصة الداخلية."
          />
        </p>
      </div>

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
                    en="Monitor booking activity, booking status, customer records, and studio reservations."
                    ar="مراقبة نشاط الحجوزات، حالة الحجز، سجلات العملاء، وحجوزات الاستوديوهات."
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
          </div>
        </div>

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

            <div>
              <strong>
                <T en="Public Site" ar="الموقع العام" />
              </strong>

              <p>
                <T
                  en="Return to the public GearBeat website."
                  ar="العودة إلى موقع GearBeat العام."
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
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Recommended Workflow" ar="مسار العمل المقترح" />
        </span>

        <h2>
          <T
            en="How studio activation should work"
            ar="كيف يجب أن يتم تفعيل الاستوديو"
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
                  en="Company details, commercial registration, national address, zakat certificate, invoice information, and agreement are completed."
                  ar="يتم إكمال بيانات الشركة، السجل التجاري، العنوان الوطني، شهادة الزكاة، بيانات الفوترة، والعقد."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T en="3. Admin approves compliance" ar="٣. الإدارة تعتمد الامتثال" />
              </strong>
              <p>
                <T
                  en="Admin reviews the owner compliance profile and approves or rejects it."
                  ar="الإدارة تراجع ملف امتثال المالك وتقوم بالاعتماد أو الرفض."
                />
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div>
              <strong>
                <T en="4. Bookings become active" ar="٤. يتم تفعيل الحجوزات" />
              </strong>
              <p>
                <T
                  en="Only approved studios with approved owner compliance become bookable."
                  ar="فقط الاستوديوهات المعتمدة والمرتبطة بمالك معتمد تصبح قابلة للحجز."
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
