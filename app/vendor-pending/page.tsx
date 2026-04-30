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

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const { data: vendorProfile } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id, business_name_en, status")
    .eq("id", user.id)
    .maybeSingle();

  // Auto-redirect if approved
  if (vendorProfile?.status === "approved") redirect("/vendor");

  // Go to onboarding if no vendor profile exists
  if (!vendorProfile) redirect("/vendor/onboarding");

  const isRejected = vendorProfile.status === "rejected";

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card" style={{ textAlign: "center", maxWidth: 560 }}>

          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>
            {isRejected ? "❌" : "⏳"}
          </div>

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

          <h1 style={{ fontSize: "1.75rem", marginTop: 12 }}>
            {isRejected
              ? <T en="Application not approved" ar="لم يتم قبول الطلب" />
              : <T en="We're reviewing your application" ar="نحن نراجع طلبك" />
            }
          </h1>

          {vendorProfile.business_name_en && (
            <p style={{ color: "var(--gb-gold)", fontWeight: 600, marginBottom: 8 }}>
              {vendorProfile.business_name_en}
            </p>
          )}

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            {isRejected ? (
              <T
                en="Your vendor application was not approved. Please contact support for more details."
                ar="لم يتم قبول طلبك كتاجر. الرجاء التواصل مع الدعم لمزيد من التفاصيل."
              />
            ) : (
              <T
                en="Your application is under review by the GearBeat team. You will be notified by email once a decision is made. This usually takes 1–3 business days."
                ar="طلبك قيد المراجعة من فريق GearBeat. ستتلقى إشعاراً على بريدك الإلكتروني فور اتخاذ القرار. عادةً ما يستغرق ذلك 1–3 أيام عمل."
              />
            )}
          </p>

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

          <div className="actions" style={{ marginTop: 28, justifyContent: "center" }}>
            {isRejected && (
              <a href="mailto:support@gearbeat.com" className="btn btn-primary">
                <T en="Contact Support" ar="تواصل مع الدعم" />
              </a>
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
