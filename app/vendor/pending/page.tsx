import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

export default async function VendorPendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?account=vendor");

  const supabaseAdmin = createAdminClient();

  // Get profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Get vendor profile
  const { data: vendorProfile } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id, business_name_en, business_name_ar, status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // If approved, redirect to dashboard
  if (vendorProfile?.status === "approved") {
    redirect("/vendor");
  }

  // If no vendor profile, go to onboarding
  if (!vendorProfile) {
    redirect("/vendor/onboarding");
  }

  const isRejected = vendorProfile.status === "rejected";

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card" style={{ textAlign: "center", maxWidth: 560 }}>

          {/* Icon */}
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>
            {isRejected ? "❌" : "⏳"}
          </div>

          {/* Badge */}
          <span className="badge" style={
            isRejected
              ? { color: "var(--gb-danger)", borderColor: "var(--gb-danger)" }
              : { color: "var(--gb-gold)", borderColor: "var(--gb-gold)" }
          }>
            {isRejected
              ? <T en="Application Rejected" ar="تم رفض الطلب" />
              : <T en="Application Under Review" ar="الطلب قيد المراجعة" />
            }
          </span>

          {/* Title */}
          <h1 style={{ fontSize: "1.75rem", marginTop: 12 }}>
            {isRejected
              ? <T en="Your application was not approved" ar="لم يتم قبول طلبك" />
              : <T en="We're reviewing your application" ar="نحن نراجع طلبك" />
            }
          </h1>

          {/* Details */}
          {vendorProfile.business_name_en && (
            <p style={{ color: "var(--gb-gold)", fontWeight: 600, marginBottom: 8 }}>
              {vendorProfile.business_name_en}
            </p>
          )}

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            {isRejected ? (
              <T
                en="Your vendor application was not approved at this time. Please contact support for more information."
                ar="لم يتم قبول طلب التاجر في الوقت الحالي. الرجاء التواصل مع الدعم لمزيد من المعلومات."
              />
            ) : (
              <T
                en="Your application has been submitted and is currently under review by the GearBeat team. You will be notified at your email once a decision is made."
                ar="تم استلام طلبك وهو قيد المراجعة من قبل فريق GearBeat. ستتلقى إشعاراً على بريدك الإلكتروني فور اتخاذ القرار."
              />
            )}
          </p>

          {/* Email note */}
          {profile?.email && (
            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 14,
              color: "var(--muted)"
            }}>
              <T en="Notification will be sent to:" ar="سيتم إرسال الإشعار إلى:" />
              {" "}
              <span style={{ color: "var(--gb-gold)", fontWeight: 600 }}>{profile.email}</span>
            </div>
          )}

          {/* Actions */}
          <div className="actions" style={{ marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {isRejected ? (
              <Link href="mailto:support@gearbeat.com" className="btn btn-primary">
                <T en="Contact Support" ar="تواصل مع الدعم" />
              </Link>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  "use server";
                  // Refresh — just reload the page
                }}
              >
                <T en="Check Status" ar="تحقق من الحالة" />
              </button>
            )}

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
