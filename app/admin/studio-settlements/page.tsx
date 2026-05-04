import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminStudioSettlementsPage() {
  await requireAdminLayoutAccess();

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Studio Settlements" ar="تسويات الاستوديوهات" />
      </h1>
      
      <div style={{ background: '#111', padding: 60, borderRadius: 24, border: '1px solid #1e1e1e', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>📑</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>
          <T en="Settlement System Coming Soon" ar="نظام التسويات قيد التطوير" />
        </h2>
        <p style={{ color: '#666', maxWidth: 500, margin: '0 auto' }}>
          <T 
            en="We are working on a dedicated interface to manage and track bank transfers and final settlements for music studio owners." 
            ar="نحن نعمل على واجهة مخصصة لإدارة وتتبع التحويلات البنكية والتسويات النهائية لأصحاب استوديوهات الموسيقى." 
          />
        </p>
      </div>
    </main>
  );
}
