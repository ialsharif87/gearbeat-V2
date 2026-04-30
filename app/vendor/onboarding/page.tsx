import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

export default async function VendorOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const supabaseAdmin = createAdminClient();

  // Check if they already have a vendor profile
  const { data: existingVendor } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id, status")
    .eq("id", user.id)
    .maybeSingle();

  if (existingVendor) {
    redirect("/vendor");
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const businessNameEn = formData.get("business_name_en") as string;
    const businessNameAr = formData.get("business_name_ar") as string;
    const slug = (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const crNumber = formData.get("cr_number") as string;
    const vatNumber = formData.get("vat_number") as string;

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("vendor_profiles")
      .insert({
        id: user.id,
        business_name_en: businessNameEn,
        business_name_ar: businessNameAr,
        slug,
        contact_email: email,
        contact_phone: phone,
        cr_number: crNumber,
        vat_number: vatNumber,
        status: 'pending',
        compliance_status: 'pending'
      });

    if (error) {
      console.error(error);
      return;
    }

    redirect("/vendor");
  }

  return (
    <div className="owner-onboarding-page">
      <div className="owner-onboarding-hero">
        <span className="badge badge-gold">
          <T en="Partner Program" ar="برنامج الشركاء" />
        </span>
        <h1>
          <T en="Become a GearBeat Vendor" ar="كن تاجراً في GearBeat" />
        </h1>
        <p>
          <T 
            en="Join the largest marketplace for music and audio gear in the Middle East. Sell to thousands of professional creators." 
            ar="انضم إلى أكبر سوق للمعدات الموسيقية والصوتية في الشرق الأوسط. بع لآلاف المبدعين المحترفين." 
          />
        </p>
      </div>

      <div className="portal-main" style={{ maxWidth: 800, margin: '0 auto' }}>
        <form action={handleSubmit} className="card owner-onboarding-form">
          <div className="grid grid-2">
            <div>
              <label><T en="Business Name (English)" ar="اسم المنشأة (إنجليزي)" /></label>
              <input name="business_name_en" className="input" required placeholder="Gear Store Co." />
            </div>
            <div>
              <label><T en="Business Name (Arabic)" ar="اسم المنشأة (عربي)" /></label>
              <input name="business_name_ar" className="input" required placeholder="شركة متجر المعدات" />
            </div>
          </div>

          <div>
            <label><T en="Store Slug (URL)" ar="رابط المتجر" /></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--muted)' }}>gearbeat.com/vendor/</span>
              <input name="slug" className="input" required placeholder="gear-store" />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <label><T en="Contact Email" ar="البريد الإلكتروني للتواصل" /></label>
              <input name="email" type="email" className="input" required placeholder="sales@gearstore.com" />
            </div>
            <div>
              <label><T en="Contact Phone" ar="رقم الهاتف" /></label>
              <input name="phone" className="input" required placeholder="+966 50 XXX XXXX" />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

          <div className="grid grid-2">
            <div>
              <label><T en="Commercial Registration (CR)" ar="السجل التجاري" /></label>
              <input name="cr_number" className="input" required placeholder="1010XXXXXX" />
            </div>
            <div>
              <label><T en="VAT Number" ar="الرقم الضريبي" /></label>
              <input name="vat_number" className="input" required placeholder="300XXXXXXXXXXXX" />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary btn-large w-full">
              <T en="Submit Application" ar="تقديم الطلب" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
