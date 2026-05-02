import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import VendorApiKeyManager from "@/components/vendor-api-key-manager";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function VendorIntegrationsPage() {
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
    <main className="dashboard-page" style={{ maxWidth: 1120, margin: "0 auto" }}>
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
            <T en="Integrations" ar="التكاملات" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Vendor system integration" ar="ربط نظام التاجر" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
            <T
              en="Connect your external inventory, ERP, or product system with GearBeat through secure API keys."
              ar="اربط نظام المخزون أو ERP أو نظام المنتجات الخاص بك مع GearBeat من خلال مفاتيح API آمنة."
            />
          </p>
        </div>

        <Link href="/portal/store/products" className="btn">
          <T en="Back to products" ar="الرجوع للمنتجات" />
        </Link>
      </section>

      <section style={{ marginTop: 28 }}>
        <VendorApiKeyManager />
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="API usage" ar="طريقة استخدام API" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Send your API key in the x-gearbeat-api-key header."
            ar="أرسل مفتاح API داخل الهيدر x-gearbeat-api-key."
          />
        </p>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            direction: "ltr",
            textAlign: "left",
            background: "rgba(0,0,0,0.35)",
            padding: 18,
            borderRadius: 16,
            overflowX: "auto",
          }}
        >
{`POST /api/v1/vendor/products
Headers:
x-gearbeat-api-key: YOUR_API_KEY
Content-Type: application/json

{
  "sku": "MIC-SHURE-SM58-001",
  "name_en": "Shure SM58 Microphone",
  "name_ar": "ميكروفون شور SM58",
  "category": "microphones",
  "brand": "shure",
  "base_price": 450,
  "stock_quantity": 10,
  "image_urls": [
    "https://example.com/image1.jpg"
  ]
}`}
        </pre>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Available endpoints" ar="الروابط المتاحة" />
        </h2>

        <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
          <li>POST /api/v1/vendor/products — create/update product</li>
          <li>GET /api/v1/vendor/products — list vendor products</li>
          <li>POST /api/v1/vendor/inventory — update stock and price</li>
          <li>GET /api/v1/vendor/orders — read vendor orders</li>
        </ul>
      </section>
    </main>
  );
}
