import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();
  const params = await (searchParams || {});
  const activeTab = params.tab || "studios";

  // Fetch admin role
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch Reviews
  const [studioReviewsData, productReviewsData] = await Promise.all([
    supabaseAdmin
      .from("studio_reviews")
      .select(`
        id, rating, comment, created_at,
        studios (name, slug),
        profiles (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("marketplace_product_reviews")
      .select(`
        id, rating, comment, created_at,
        marketplace_products (name),
        profiles (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Reviews Management" ar="إدارة التقييمات" />
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #1a1a1a', marginBottom: 32 }}>
        <Link 
          href="/admin/reviews?tab=studios" 
          style={{ 
            padding: '12px 0', 
            fontSize: '1rem', 
            fontWeight: activeTab === 'studios' ? 700 : 400, 
            color: activeTab === 'studios' ? '#fff' : '#666', 
            textDecoration: 'none', 
            borderBottom: `2px solid ${activeTab === 'studios' ? '#cfa86e' : 'transparent'}`,
            transition: 'all 0.2s'
          }}
        >
          <T en="Studio Reviews" ar="تقييمات الاستوديوهات" />
        </Link>
        <Link 
          href="/admin/reviews?tab=products" 
          style={{ 
            padding: '12px 0', 
            fontSize: '1rem', 
            fontWeight: activeTab === 'products' ? 700 : 400, 
            color: activeTab === 'products' ? '#fff' : '#666', 
            textDecoration: 'none', 
            borderBottom: `2px solid ${activeTab === 'products' ? '#cfa86e' : 'transparent'}`,
            transition: 'all 0.2s'
          }}
        >
          <T en="Product Reviews" ar="تقييمات المنتجات" />
        </Link>
      </div>

      {/* Reviews Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Reviewer" ar="المُقيِّم" /></th>
              <th style={thStyle}><T en={activeTab === 'studios' ? "Studio" : "Product"} ar={activeTab === 'studios' ? "الاستوديو" : "المنتج"} /></th>
              <th style={thStyle}><T en="Rating" ar="التقييم" /></th>
              <th style={thStyle}><T en="Comment" ar="التعليق" /></th>
              <th style={thStyle}><T en="Date" ar="التاريخ" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'studios' ? (
              studioReviewsData.data?.map((rev: any) => (
                <ReviewRow 
                  key={rev.id} 
                  id={rev.id} 
                  reviewer={rev.profiles?.full_name} 
                  target={rev.studios?.name} 
                  rating={rev.rating} 
                  comment={rev.comment} 
                  date={rev.created_at} 
                  isSuperAdmin={isSuperAdmin}
                  type="studio"
                />
              ))
            ) : (
              productReviewsData.data?.map((rev: any) => (
                <ReviewRow 
                  key={rev.id} 
                  id={rev.id} 
                  reviewer={rev.profiles?.full_name} 
                  target={rev.marketplace_products?.name} 
                  rating={rev.rating} 
                  comment={rev.comment} 
                  date={rev.created_at} 
                  isSuperAdmin={isSuperAdmin}
                  type="product"
                />
              ))
            )}
          </tbody>
        </table>
        {(activeTab === 'studios' ? studioReviewsData.data?.length : productReviewsData.data?.length) === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <T en="No reviews found." ar="لا توجد تقييمات." />
          </div>
        )}
      </div>
    </main>
  );
}

function ReviewRow({ id, reviewer, target, rating, comment, date, isSuperAdmin, type }: any) {
  return (
    <tr style={{ borderBottom: '1px solid #111' }}>
      <td style={tdStyle}>{reviewer || "Guest"}</td>
      <td style={{ ...tdStyle, fontWeight: 600 }}>{target}</td>
      <td style={tdStyle}>
        <div style={{ color: '#eab308', letterSpacing: 2 }}>
          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
        </div>
      </td>
      <td style={{ ...tdStyle, maxWidth: 300, fontSize: '0.85rem', color: '#888' }}>{comment}</td>
      <td style={tdStyle}>{new Date(date).toLocaleDateString()}</td>
      <td style={tdStyle}>
        {isSuperAdmin && (
          <form action={deleteReviewAction} onSubmit={(e) => { if(!window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) e.preventDefault(); }}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="type" value={type} />
            <button style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
              <T en="Delete" ar="حذف" />
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };

// Server Action
async function deleteReviewAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const type = formData.get("type")?.toString();
  const supabaseAdmin = createAdminClient();
  
  const table = type === 'studio' ? 'studio_reviews' : 'marketplace_product_reviews';
  await supabaseAdmin.from(table).delete().eq("id", id);
  
  revalidatePath("/admin/reviews");
}
