import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import VendorProductBulkUploadBox from "@/components/vendor-product-bulk-upload-box";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function VendorBulkProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("auth_user_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile || !["vendor", "admin"].includes(profile.role)) {
    redirect("/forbidden");
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Products" ar="المنتجات" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Bulk product upload" ar="رفع المنتجات بالجملة" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
            <T
              en="Upload many products at once using an Excel-compatible CSV template."
              ar="ارفع عدة منتجات دفعة واحدة باستخدام قالب CSV متوافق مع Excel."
            />
          </p>
        </div>

        <Link href="/portal/store/products" className="btn">
          <T en="Back to products" ar="الرجوع للمنتجات" />
        </Link>
      </section>

      <section style={{ marginTop: 28 }}>
        <VendorProductBulkUploadBox />
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="How to fill the file" ar="طريقة تعبئة الملف" />
        </h2>

        <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
          <li>
            <T
              en="Use category slug or exact category name, such as microphones or mixers."
              ar="استخدم رمز التصنيف أو اسمه مثل microphones أو mixers."
            />
          </li>
          <li>
            <T
              en="Use brand slug or exact brand name, such as shure or yamaha."
              ar="استخدم رمز العلامة أو اسمها مثل shure أو yamaha."
            />
          </li>
          <li>
            <T
              en="For multiple images, separate image URLs using the | symbol."
              ar="لإضافة عدة صور، افصل روابط الصور بعلامة |."
            />
          </li>
          <li>
            <T
              en="Imported products will be saved as pending review."
              ar="المنتجات المرفوعة سيتم حفظها بحالة انتظار المراجعة."
            />
          </li>
        </ul>
      </section>
    </main>
  );
}
