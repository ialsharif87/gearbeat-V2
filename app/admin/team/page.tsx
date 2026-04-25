import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireSuperAdmin } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

const adminRoles = [
  { value: "operations", label: "Operations" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "content", label: "Content" },
  { value: "sales", label: "Sales" },
  { value: "super_admin", label: "Super Admin" }
];

async function findAuthUserByEmail(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  email: string
) {
  let page = 1;
  const perPage = 100;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      throw new Error(error.message);
    }

    const foundUser = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      return foundUser;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

export default async function AdminTeamPage() {
  const { user } = await requireSuperAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: admins, error } = await supabaseAdmin
    .from("admin_users")
    .select("id,auth_user_id,email,full_name,admin_role,status,created_at")
    .order("created_at", { ascending: false });

  async function addAdminUser(formData: FormData) {
    "use server";

    const { user } = await requireSuperAdmin();
    const supabaseAdmin = createAdminClient();

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const fullName = String(formData.get("full_name") || "").trim();
    const adminRole = String(formData.get("admin_role") || "support").trim();
    const tempPassword = String(formData.get("temp_password") || "").trim();

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!adminRole) {
      throw new Error("Admin role is required.");
    }

    if (!tempPassword || tempPassword.length < 8) {
      throw new Error("Temporary password must be at least 8 characters.");
    }

    const allowedRoles = [
      "super_admin",
      "operations",
      "support",
      "finance",
      "content",
      "sales"
    ];

    if (!allowedRoles.includes(adminRole)) {
      throw new Error("Invalid admin role.");
    }

    let authUser = await findAuthUserByEmail(supabaseAdmin, email);

    if (!authUser) {
      const { data: createdUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            created_by_admin: true
          }
        });

      if (createUserError) {
        throw new Error(createUserError.message);
      }

      authUser = createdUser.user;
    } else {
      const { error: updateUserError } =
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
          password: tempPassword,
          user_metadata: {
            ...(authUser.user_metadata || {}),
            full_name: fullName,
            admin_role: adminRole
          }
        });

      if (updateUserError) {
        throw new Error(updateUserError.message);
      }
    }

    const { error: upsertError } = await supabaseAdmin
      .from("admin_users")
      .upsert(
        {
          auth_user_id: authUser.id,
          email,
          full_name: fullName,
          admin_role: adminRole,
          status: "active",
          created_by: user.id,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "email"
        }
      );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    revalidatePath("/admin/team");
    revalidatePath("/admin");
  }

  async function updateAdminStatus(formData: FormData) {
    "use server";

    const { user } = await requireSuperAdmin();
    const supabaseAdmin = createAdminClient();

    const adminId = String(formData.get("admin_id") || "");
    const status = String(formData.get("status") || "");

    if (!adminId) {
      throw new Error("Missing admin ID.");
    }

    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new Error("Invalid status.");
    }

    const { data: targetAdmin, error: targetError } = await supabaseAdmin
      .from("admin_users")
      .select("id,auth_user_id,email,admin_role")
      .eq("id", adminId)
      .single();

    if (targetError || !targetAdmin) {
      throw new Error("Admin user not found.");
    }

    if (targetAdmin.auth_user_id === user.id && status !== "active") {
      throw new Error("You cannot disable your own super admin account.");
    }

    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", adminId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/admin/team");
    revalidatePath("/admin");
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Super Admin" ar="سوبر أدمن" />
        </span>

        <h1>
          <T en="Admin Team" ar="فريق الإدارة" />
        </h1>

        <p>
          <T
            en="Create and manage company staff accounts directly from GearBeat."
            ar="أنشئ وأدر حسابات موظفي الشركة مباشرة من GearBeat."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>
      </div>

      <div className="admin-two-column">
        <form className="card form" action={addAdminUser}>
          <span className="badge">
            <T en="Add Staff" ar="إضافة موظف" />
          </span>

          <h2>
            <T en="Create staff admin account" ar="إنشاء حساب موظف إداري" />
          </h2>

          <p>
            <T
              en="This will create the user account and assign admin permissions. The staff member can login using the temporary password."
              ar="سيتم إنشاء حساب المستخدم وإعطاؤه صلاحيات الإدارة. يمكن للموظف تسجيل الدخول باستخدام كلمة المرور المؤقتة."
            />
          </p>

          <label>
            <T en="Full name" ar="الاسم الكامل" />
          </label>
          <input
            className="input"
            name="full_name"
            placeholder="Full name"
            required
          />

          <label>
            <T en="Email" ar="البريد الإلكتروني" />
          </label>
          <input
            className="input"
            name="email"
            type="email"
            placeholder="employee@company.com"
            required
          />

          <label>
            <T en="Admin role" ar="صلاحية الأدمن" />
          </label>
          <select className="input" name="admin_role" defaultValue="support">
            {adminRoles.map((role) => (
              <option value={role.value} key={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <label>
            <T en="Temporary password" ar="كلمة مرور مؤقتة" />
          </label>
          <input
            className="input"
            name="temp_password"
            type="text"
            placeholder="Minimum 8 characters"
            required
          />

          <button className="btn" type="submit">
            <T en="Create Staff Account" ar="إنشاء حساب الموظف" />
          </button>
        </form>

        <div className="card">
          <span className="badge">
            <T en="Roles" ar="الصلاحيات" />
          </span>

          <h2>
            <T en="Permission levels" ar="مستويات الصلاحيات" />
          </h2>

          <div className="admin-role-list">
            <div>
              <strong>Super Admin</strong>
              <p>
                <T
                  en="Full access. Can add and manage staff."
                  ar="صلاحية كاملة. يستطيع إضافة وإدارة الموظفين."
                />
              </p>
            </div>

            <div>
              <strong>Operations</strong>
              <p>
                <T
                  en="Studios, bookings, and operational follow-up."
                  ar="الاستوديوهات، الحجوزات، والمتابعة التشغيلية."
                />
              </p>
            </div>

            <div>
              <strong>Support</strong>
              <p>
                <T
                  en="Customer support, bookings, and review follow-up."
                  ar="دعم العملاء، الحجوزات، ومتابعة التقييمات."
                />
              </p>
            </div>

            <div>
              <strong>Finance</strong>
              <p>
                <T
                  en="Payments, paid bookings, and financial monitoring."
                  ar="المدفوعات، الحجوزات المدفوعة، والمتابعة المالية."
                />
              </p>
            </div>

            <div>
              <strong>Content</strong>
              <p>
                <T
                  en="Studio content, descriptions, media, and reviews."
                  ar="محتوى الاستوديوهات، الوصف، الصور، والتقييمات."
                />
              </p>
            </div>

            <div>
              <strong>Sales</strong>
              <p>
                <T
                  en="Owner/vendor follow-up and commercial pipeline."
                  ar="متابعة أصحاب الاستوديوهات والبائعين والفرص التجارية."
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Current Staff" ar="الموظفون الحاليون" />
        </span>

        <h2>
          <T en="Admin users" ar="مستخدمو الإدارة" />
        </h2>

        {error ? <p>{error.message}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Name" ar="الاسم" />
                </th>
                <th>
                  <T en="Email" ar="البريد" />
                </th>
                <th>
                  <T en="Role" ar="الصلاحية" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {admins?.length ? (
                admins.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name || "-"}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className="badge">{item.admin_role}</span>
                    </td>
                    <td>
                      <span className="badge">{item.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        {item.status !== "active" ? (
                          <form action={updateAdminStatus}>
                            <input
                              type="hidden"
                              name="admin_id"
                              value={item.id}
                            />
                            <input type="hidden" name="status" value="active" />
                            <button className="btn btn-small" type="submit">
                              <T en="Activate" ar="تفعيل" />
                            </button>
                          </form>
                        ) : (
                          <form action={updateAdminStatus}>
                            <input
                              type="hidden"
                              name="admin_id"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="status"
                              value="suspended"
                            />
                            <button
                              className="btn btn-secondary btn-small"
                              type="submit"
                            >
                              <T en="Suspend" ar="إيقاف" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <T en="No admin users found." ar="لا يوجد مستخدمون إداريون." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
