import Link from "next/link";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CertificationStatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cert } = await supabase
    .from("certified_studios")
    .select(`
      id,
      status,
      created_at,
      studio:studios!inner(name_en,name_ar,slug)
    `)
    .eq("studio.slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  const studio = Array.isArray(cert?.studio) ? cert.studio[0] : cert?.studio;
  const displayName = studio?.name_en || studio?.name_ar || slug.replaceAll("-", " ");
  const hasReviewRecord = Boolean(cert);
  return (
    <main className="dashboard-page" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 20px" }}>
      <div className="card-premium" style={{ padding: 36, textAlign: "center" }}>
        <span className="badge badge-gold">
          <T en="Certification preview" ar="معاينة التوثيق" />
        </span>
        <h1 style={{ margin: "18px 0 12px" }}>{displayName}</h1>
        <h2 style={{ color: "var(--gb-gold)", marginBottom: 16 }}>
          {hasReviewRecord ? (
            <T en="Partner review record found" ar="تم العثور على سجل مراجعة للشريك" />
          ) : (
            <T en="No active review record" ar="لا يوجد سجل مراجعة نشط" />
          )}
        </h2>
        <p style={{ color: "var(--gb-text-muted)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>
          <T
            en="This page only reflects an internal GearBeat partner-review record. It is not a guarantee of equipment condition, acoustics, availability, payment safety, regulatory compliance, or session outcomes."
            ar="تعكس هذه الصفحة سجل مراجعة داخليًا لشريك في GearBeat فقط. وهي لا تمثل ضمانًا لحالة المعدات أو جودة الصوتيات أو التوفر أو أمان الدفع أو الامتثال التنظيمي أو نتائج الجلسة."
          />
        </p>
        {hasReviewRecord ? (
          <p style={{ marginTop: 18, color: "var(--gb-text-muted)", fontSize: ".9rem" }}>
            <T en="Review record created:" ar="تاريخ إنشاء سجل المراجعة:" />{" "}
            {new Date(cert!.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          {studio?.slug ? (
            <Link href={`/studios/${studio.slug}`} className="btn btn-primary">
              <T en="View studio" ar="عرض الاستوديو" />
            </Link>
          ) : null}
          <Link href="/gearbeat-certified" className="btn btn-outline">
            <T en="About the preview" ar="حول المعاينة" />
          </Link>
          <Link href="/studios" className="btn btn-outline">
            <T en="Find a Studio" ar="ابحث عن استوديو" />
          </Link>
        </div>
      </div>
    </main>
  );
}
