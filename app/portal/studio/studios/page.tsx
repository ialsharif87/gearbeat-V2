import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
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
    redirect("/portal/login");
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

  if (profile.role !== "owner" && profile.role !== "studio_owner") {
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

function calculateCompletion(studio: any) {
  let score = 0;
  if (studio.name && studio.slug) score += 10;
  if (studio.city && studio.district) score += 10;
  if (studio.cover_image_url) score += 20;
  // Assuming equipment and features are stored in studio as arrays or JSON
  if (studio.equipment && studio.equipment.length > 0) score += 20;
  if (studio.features && studio.features.length > 0) score += 10;
  if (studio.price_from > 0) score += 20;
  if (studio.gallery && studio.gallery.length >= 3) score += 10;
  return score;
}

export default async function OwnerStudiosPage() {
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();

  // 1. Fetch Application & Limit info
  const { data: app } = await supabaseAdmin
    .from("studio_applications")
    .select("final_approved_at, studio_limit")
    .eq("linked_user_id", user.id)
    .maybeSingle();

  const isFullyActivated = !!app?.final_approved_at;
  const limit = app?.studio_limit || 0;

  // 2. Fetch Studios
  const { data: studios, error } = await supabaseAdmin
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,verified,booking_enabled,owner_compliance_status,cover_image_url,created_at"
    )
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  const currentCount = studios?.length || 0;
  const canAddMore = isFullyActivated && currentCount < limit;

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
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="My Studios" ar="استوديوهاتي" />
          </h1>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" }}>
            <p className="gb-muted-text">
              <T
                en="Manage the studios you created on GearBeat."
                ar="أدر الاستوديوهات التي أنشأتها على GearBeat."
              />
            </p>
            <span style={{ fontSize: "0.85rem", background: "rgba(212, 175, 55, 0.1)", color: "var(--gb-gold)", padding: "4px 12px", borderRadius: 99, fontWeight: 700 }}>
              <T en={`Limit: ${currentCount} / ${limit}`} ar={`الحد: ${currentCount} / ${limit}`} />
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/portal/studio" className="gb-button gb-button-outline">
            <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>
          
          {canAddMore ? (
            <Link href="/portal/studio/create-studio" className="gb-button gb-button-primary">
              <T en="Create New Studio" ar="إنشاء استوديو جديد" />
            </Link>
          ) : (
            <button className="gb-button gb-button-primary" style={{ opacity: 0.5, cursor: "not-allowed" }} disabled>
              <T en="Create New Studio" ar="إنشاء استوديو جديد" />
            </button>
          )}
        </div>
      </section>

      {/* Activation Alert */}
      {!isFullyActivated && (
        <div style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)", padding: 20, borderRadius: 16, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 800, color: "var(--gb-gold)" }}><T en="Account Activation Required" ar="مطلوب تفعيل الحساب" /></div>
              <div style={{ fontSize: "0.85rem", color: "#888" }}><T en="Please sign your contract to start adding studios." ar="يرجى توقيع العقد للبدء في إضافة الاستوديوهات." /></div>
            </div>
          </div>
          <Link href="/portal/studio/contract" className="gb-button gb-button-primary" style={{ padding: "0 24px", height: 44 }}>
            <T en="Go to Contract" ar="انتقل للعقد" />
          </Link>
        </div>
      )}

      {isFullyActivated && currentCount >= limit && (
        <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: 20, borderRadius: 16, marginBottom: 40, display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: "1.5rem" }}>🚀</span>
          <div>
            <div style={{ fontWeight: 800, color: "var(--gb-teal)" }}><T en="Studio Limit Reached" ar="تم الوصول للحد الأقصى" /></div>
            <div style={{ fontSize: "0.85rem", color: "#888" }}><T en="To add more studios, contact support to upgrade your plan." ar="لإضافة المزيد من الاستوديوهات، تواصل مع الدعم لترقية باقتك." /></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <Link href="/portal/studio/onboarding" className="gb-button gb-button-outline" style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)', color: 'var(--gb-gold)' }}>
          <T en="Business Onboarding" ar="بيانات النشاط" />
        </Link>
      </div>

      <div className="gb-card-grid gb-dash-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {studios?.length ? (
          studios.map((studio) => {
            const bookable = isStudioBookable(studio);
            const readinessReason = getStudioReadinessReason(studio);
            const completion = calculateCompletion(studio);

            return (
              <article className="gb-card" key={studio.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '220px', background: '#000' }}>
                  {studio.cover_image_url ? (
                    <img 
                      src={studio.cover_image_url} 
                      alt={studio.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gb-text-muted)', background: 'rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.2 }}>🎙️</span>
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    {bookable ? (
                      <span className="gb-dash-badge" style={{ background: 'rgba(15, 160, 138, 0.9)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <T en="Live" ar="منشور" />
                      </span>
                    ) : (
                      <span className="gb-dash-badge" style={{ background: 'rgba(239, 68, 68, 0.9)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <T en="Draft / Locked" ar="مسودة / مقفل" />
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span className="gb-dash-badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                        {studio.status === "approved" ? <T en="Approved" ar="موافق عليه" /> : studio.status.toUpperCase()}
                      </span>
                      {studio.verified && (
                        <span className="gb-dash-badge" style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)' }}>
                          <T en="Verified" ar="موثق" />
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: 0 }}>{studio.name}</h2>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Completion Bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.75rem", fontWeight: 700 }}>
                      <span style={{ color: completion === 100 ? "var(--gb-teal)" : "#888" }}>
                        <T en="Profile Completion" ar="اكتمال الملف" />
                      </span>
                      <span style={{ color: "white" }}>{completion}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${completion}%`, height: "100%", background: completion === 100 ? "var(--gb-teal)" : "var(--gb-gold)", transition: "width 1s ease-in-out" }} />
                    </div>
                  </div>

                  <p className="gb-muted-text" style={{ fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span> {studio.city} {studio.district ? ` · ${studio.district}` : ""}
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--gb-border)', marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gb-text-muted)', margin: 0, lineHeight: 1.4 }}>
                      <T en={readinessReason.en} ar={readinessReason.ar} />
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: 'auto' }}>
                    <Link
                      href={`/portal/studio/studios/${studio.id}/manage`}
                      className="gb-button gb-button-outline"
                      style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}
                    >
                      <T en="Edit Data" ar="تعديل البيانات" />
                    </Link>

                    {completion === 100 ? (
                      <button className="gb-button gb-button-primary" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}>
                        <T en="Publish" ar="نشر الآن" />
                      </button>
                    ) : (
                      <button className="gb-button gb-button-primary" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", opacity: 0.3, cursor: "not-allowed" }} disabled title="Complete 100% to publish">
                        <T en="Publish" ar="نشر" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="gb-card gb-empty-state" style={{ padding: '80px 40px', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.1 }}>🎙️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              <T en="No studios yet" ar="لا توجد استوديوهات بعد" />
            </h2>
            <p className="gb-muted-text">
              <T en="You have not created any studios yet. Start your journey by creating your first listing." ar="لم تقم بإنشاء أي استوديو حتى الآن. ابدأ رحلتك بإنشاء أول قائمة لك." />
            </p>
            <Link href="/portal/studio/create-studio" className="gb-button gb-button-primary" style={{ marginTop: '32px', padding: '14px 40px' }}>
              <T en="Create Your First Studio" ar="أنشئ استوديوك الأول" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
