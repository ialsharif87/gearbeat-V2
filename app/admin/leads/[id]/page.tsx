import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminLayoutAccess();
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: lead, error } = await supabase
    .from("provider_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main style={{ padding: '32px', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/leads" style={{ color: '#cfa86e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← <T en="Back to Leads" ar="العودة للطلبات" />
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <span className={`badge ${lead.type === 'studio' ? 'badge-blue' : 'badge-gold'}`} style={{ marginBottom: '12px' }}>
            {lead.type.toUpperCase()}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{lead.business_name}</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>
            <T en="Submitted on" ar="تاريخ التقديم" />: {formatDate(lead.created_at)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span className={`badge badge-${lead.status === 'new' ? 'warning' : 'info'}`} style={{ padding: '8px 16px', fontSize: '1rem' }}>
             {lead.status.toUpperCase()}
           </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Section 1: Business Details */}
        <section className="card" style={{ background: '#111', padding: '24px', borderRadius: '16px', border: '1px solid #1e1e1e' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#cfa86e' }}>
            <T en="Business Information" ar="معلومات المنشأة" />
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
              <span style={{ color: '#666' }}><T en="Email" ar="البريد الإلكتروني" /></span>
              <span>{lead.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
              <span style={{ color: '#666' }}><T en="City" ar="المدينة" /></span>
              <span>{lead.city}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
              <span style={{ color: '#666' }}><T en="Manager Name" ar="اسم المسؤول" /></span>
              <span>{lead.name}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Documents */}
        <section className="card" style={{ background: '#111', padding: '24px', borderRadius: '16px', border: '1px solid #1e1e1e' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#cfa86e' }}>
            <T en="Uploaded Documents" ar="المستندات المرفوعة" />
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { label: "Commercial Registration", label_ar: "السجل التجاري", key: "cr_file" },
              { label: "VAT Certificate", label_ar: "شهادة الضريبة", key: "vat_file" },
              { label: "National Address", label_ar: "العنوان الوطني", key: "address_file" },
              { label: "Contract / Declaration", label_ar: "العقد / الإقرار", key: "contract_file" },
            ].map(doc => (
              <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}><T en={doc.label} ar={doc.label_ar} /></span>
                <span style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  <T en="No file attached" ar="لا يوجد ملف" />
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#555' }}>
            <T en="Files are being stored securely in Supabase Storage." ar="يتم تخزين الملفات بشكل آمن في Supabase." />
          </p>
        </section>
      </div>

      {/* Message / Additional Info */}
      <section style={{ marginTop: '24px' }}>
        <div className="card" style={{ background: '#111', padding: '24px', borderRadius: '16px', border: '1px solid #1e1e1e' }}>
           <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#cfa86e' }}>
             <T en="Additional Message" ar="رسالة إضافية" />
           </h2>
           <p style={{ margin: 0, lineHeight: 1.6, color: '#ccc' }}>
             {lead.message || <T en="No additional message provided." ar="لا توجد رسالة إضافية." />}
           </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .badge-blue { background: #3b82f6; color: #fff; padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
        .badge-gold { background: #cfa86e; color: #000; padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
      `}} />
    </main>
  );
}
