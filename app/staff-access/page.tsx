import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";

export default async function StaffAccessPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const supabaseAdmin = createAdminClient();

    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, admin_role, status")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (adminUser) {
      redirect("/admin");
    }

    redirect("/forbidden");
  }

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">
          <span className="badge">
            <T en="Team Access" ar="دخول الفريق" />
          </span>

          <h1>
            <T en="GearBeat Team Access" ar="دخول فريق GearBeat" />
          </h1>

          <p>
            <T
              en="This page is only for GearBeat admins and authorized team members."
              ar="هذه الصفحة مخصصة فقط للإدارة والموظفين المصرح لهم في GearBeat."
            />
          </p>

          <div className="actions">
            <Link href="/login?next=/admin" className="btn">
              <T en="Admin / Staff Login" ar="دخول الأدمن / الموظفين" />
            </Link>

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
