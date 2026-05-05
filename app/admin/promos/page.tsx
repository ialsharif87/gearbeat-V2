import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const supabase = createAdminClient();

  // Fetch current promos
  const { data: promos } = await supabase
    .from("marketplace_promos")
    .select("*")
    .order("priority", { ascending: false });

  return (
    <div style={{ padding: 40, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="badge badge-gold"><T en="Marketing" ar="التسويق" /></span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: 12 }}>
            <T en="Promos & Banners" ar="العروض والبنرات" />
          </h1>
        </div>
        <button className="btn btn-gold">
          <T en="+ New Promo" ar="+ عرض جديد" />
        </button>
      </header>

      {/* PROMO GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {promos && promos.length > 0 ? (
          promos.map((promo) => (
            <div key={promo.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #1a1a1a' }}>
              <div style={{ height: 160, background: `url(${promo.image_url}) center/cover`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, background: promo.is_active ? '#22c55e' : '#555', padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 900 }}>
                  {promo.is_active ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{promo.title_en}</h3>
                <h4 style={{ margin: '4px 0 12px', fontSize: '1rem', color: '#cfa86e' }}>{promo.title_ar}</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', height: 40, overflow: 'hidden' }}>{promo.description_en}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid #1a1a1a' }}>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    <T en="Priority:" ar="الأولوية:" /> <strong>{promo.priority}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-small btn-secondary"><T en="Edit" ar="تعديل" /></button>
                    <form action={togglePromoAction}>
                      <input type="hidden" name="id" value={promo.id} />
                      <input type="hidden" name="active" value={String(!promo.is_active)} />
                      <button className={`btn btn-small ${promo.is_active ? 'btn-danger' : 'btn-success'}`}>
                        {promo.is_active ? <T en="Disable" ar="إيقاف" /> : <T en="Enable" ar="تفعيل" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: 80, textAlign: 'center', background: '#111', borderRadius: 24, border: '1px dashed #333' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🏷️</div>
            <h3><T en="No Active Promos" ar="لا توجد عروض نشطة" /></h3>
            <p style={{ color: '#555' }}><T en="Start by adding your first hero banner or bank discount." ar="ابدأ بإضافة أول بنر إعلاني أو عرض بنكي." /></p>
          </div>
        )}
      </div>

      {/* QUICK MIGRATION TIP */}
      <div style={{ marginTop: 60, padding: 24, background: 'rgba(207,168,110,0.05)', borderRadius: 16, border: '1px solid rgba(207,168,110,0.1)' }}>
        <h4 style={{ color: '#cfa86e', margin: '0 0 8px' }}>💡 <T en="Pro Tip" ar="نصيحة" /></h4>
        <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
          <T 
            en="Banners appear on the homepage in order of priority. Use 'Priority 10' for seasonal mega-events." 
            ar="تظهر البنرات في الصفحة الرئيسية حسب الأولوية. استخدم 'الأولوية 10' للمناسبات الموسمية الكبرى."
          />
        </p>
      </div>
    </div>
  );
}

async function togglePromoAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  const supabase = createAdminClient();
  await supabase.from("marketplace_promos").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/promos");
  revalidatePath("/");
}
