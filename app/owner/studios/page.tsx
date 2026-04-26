import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    redirect("/login?account=owner");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner") {
    redirect("/forbidden");
  }

  return { user, profile };
}

function isStudioBookable(studio: any) {
  return (
    studio.status === "approved" &&
    studio.verified === true &&
    studio.booking_enabled === true &&
    studio.owner_compliance_status === "approved"
  );
}

function getStudioReadinessReason(studio: any) {
  if (studio.status !== "approved") {
    return {
      en: "Waiting for admin approval",
      ar: "بانتظار اعتماد الإدارة"
    };
  }

  if (!studio.verified) {
    return {
      en: "Waiting for studio verification",
      ar: "بانتظار توثيق الاستوديو"
    };
  }

  if (studio.owner_compliance_status !== "approved") {
    return {
      en: "Business onboarding is not approved yet",
      ar: "بيانات النشاط التجاري لم تعتمد بعد"
    };
  }

  if (!studio.booking_enabled) {
    return {
      en: "Booking is disabled",
      ar: "الحجز غير مفعل"
    };
  }

  return {
    en: "Ready for bookings",
    ar: "جاهز للحجز"
  };
}

export default async function OwnerStudiosPage() {
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();

  const { data: studios, error } = await supabaseAdmin
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,verified,booking_enabled,owner_compliance_status,cover_image_url,created_at"
    )
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="My Studios" ar="استوديوهاتي" />
        </h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner" ar="مالك الاستوديو" />
        </span>

        <h1>
          <T en="My Studios" ar="استوديوهاتي" />
        </h1>

        <p>
          <T
            en="Manage the studios you created on GearBeat and track their approval and booking readiness."
            ar="أدر الاستوديوهات التي أنشأتها على GearBeat وتابع حالة الاعتماد وجاهزية الحجز."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner/create-studio" className="btn">
          <T en="Create New Studio" ar="إنشاء استوديو جديد" />
        </Link>

        <Link href="/owner/onboarding" className="btn btn-secondary">
          <T en="Business Onboarding" ar="بيانات النشاط" />
        </Link>

        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>
      </div>

      <div className="grid">
        {studios?.length ? (
          studios.map((studio) => {
            const bookable = isStudioBookable(studio);
            const readinessReason = getStudioReadinessReason(studio);

            return (
              <article className="card studio-card" key={studio.id}>
                <div className="studio-cover">
                  {studio.cover_image_url ? (
                    <img src={studio.cover_image_url} alt={studio.name} />
                  ) : (
                    <div className="placeholder">
                      <T en="No Image" ar="لا توجد صورة" />
                    </div>
                  )}

                  <div className="studio-card-floating-badges">
                    {bookable ? (
                      <span className="badge studio-bookable-badge">
                        <T en="Bookable" ar="قابل للحجز" />
                      </span>
                    ) : (
                      <span className="badge studio-coming-soon-badge">
                        <T en="Not bookable" ar="غير قابل للحجز" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="studio-card-body">
                  <div className="actions" style={{ marginTop: 0 }}>
                    <span className="badge">{studio.status}</span>

                    {studio.verified ? (
                      <span className="badge">
                        <T en="Verified" ar="موثق" />
                      </span>
                    ) : (
                      <span className="badge">
                        <T en="Not verified" ar="غير موثق" />
                      </span>
                    )}

                    <span className="badge">
                      <T en="Booking:" ar="الحجز:" />{" "}
                      {studio.booking_enabled ? "On" : "Off"}
                    </span>
                  </div>

                  <h2>{studio.name}</h2>

                  <p>
                    {studio.city}
                    {studio.district ? ` · ${studio.district}` : ""}
                  </p>

                  <p>
                    <T en="From" ar="من" />{" "}
                    <strong>{studio.price_from ?? 0} SAR</strong>
                  </p>

                  <div className="owner-studio-readiness-box">
                    <strong>
                      {bookable ? (
                        <T en="Ready for bookings" ar="جاهز للحجز" />
                      ) : (
                        <T en="Not ready yet" ar="غير جاهز بعد" />
                      )}
                    </strong>

                    <p>
                      <T
                        en={readinessReason.en}
                        ar={readinessReason.ar}
                      />
                    </p>

                    <div className="admin-badge-stack">
                      <span className="badge">
                        <T en="Owner compliance:" ar="امتثال المالك:" />{" "}
                        {studio.owner_compliance_status || "incomplete"}
                      </span>

                      <span className="badge">
                        <T en="Public status:" ar="حالة النشر:" />{" "}
                        {studio.status}
                      </span>
                    </div>
                  </div>

                  <div className="actions">
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="btn btn-small"
                    >
                      <T en="View Public Page" ar="عرض الصفحة العامة" />
                    </Link>

                    <Link
                      href={`/owner/studios/${studio.id}/manage`}
                      className="btn btn-secondary btn-small"
                    >
                      <T en="Manage" ar="إدارة" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="card">
            <h2>
              <T en="No studios yet" ar="لا توجد استوديوهات بعد" />
            </h2>

            <p>
              <T
                en="You have not created any studios yet."
                ar="لم تقم بإنشاء أي استوديو حتى الآن."
              />
            </p>

            <Link href="/owner/create-studio" className="btn">
              <T en="Create Studio" ar="إنشاء استوديو" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
