import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import LeadsClient from "./leads-client"; // I'll define this below or use a separate component if allowed.
// But the prompt says "Rewrite app/admin/leads/page.tsx completely".
// I will put everything in one file using "use client" for the interactive part 
// and "use server" for actions.

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; status?: string }>;
}) {
  await requireAdminLayoutAccess();
  const params = searchParams ? await searchParams : {};
  const typeFilter = params.type || "all";
  const statusFilter = params.status || "all";

  const supabase = await createClient();
  let query = supabase
    .from("provider_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: leads, error } = await query;

  // Stats calculation
  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    invited: leads?.filter(l => l.status === 'invited').length || 0,
    approved: leads?.filter(l => l.status === 'approved').length || 0,
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
            <T en="Provider Applications" ar="طلبات المزودين" />
          </h1>
          <p style={{ color: '#888', marginTop: 8 }}>
            <T en="Manage and review seller and studio onboarding requests." ar="إدارة ومراجعة طلبات انضمام التجار والاستوديوهات." />
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard labelEn="Total" labelAr="الإجمالي" value={stats.total} />
        <StatCard labelEn="New" labelAr="جديد" value={stats.new} color="#eab308" />
        <StatCard labelEn="Contacted" labelAr="تم التواصل" value={stats.contacted} color="#3b82f6" />
        <StatCard labelEn="Invited" labelAr="تمت الدعوة" value={stats.invited} color="#cfa86e" />
        <StatCard labelEn="Approved" labelAr="معتمد" value={stats.approved} color="#22c55e" />
      </div>

      <LeadsList leads={leads || []} filters={{ type: typeFilter, status: statusFilter }} />
    </main>
  );
}

function StatCard({ labelEn, labelAr, value, color }: any) {
  return (
    <div style={{ background: '#111', padding: '16px 24px', borderRadius: 12, border: '1px solid #1e1e1e' }}>
      <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
        <T en={labelEn} ar={labelAr} />
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#fff' }}>{value}</div>
    </div>
  );
}

// Client Components for Interactivity
// ---------------------------------------------------------
"use client";
import { useState, useTransition } from "react";
import { Resend } from "resend";

function LeadsList({ leads, filters }: { leads: any[]; filters: any }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* Filters & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Type Filters */}
          <div style={{ display: 'flex', background: '#111', padding: 4, borderRadius: 8, border: '1px solid #1e1e1e' }}>
            {['all', 'seller', 'studio'].map(t => (
              <a 
                key={t}
                href={`/admin/leads?type=${t}&status=${filters.status}`}
                style={{ 
                  padding: '6px 16px', 
                  fontSize: '0.85rem', 
                  borderRadius: 6, 
                  textDecoration: 'none',
                  background: filters.type === t ? '#cfa86e' : 'transparent',
                  color: filters.type === t ? '#000' : '#888',
                  fontWeight: filters.type === t ? 700 : 400
                }}
              >
                {t.toUpperCase()}
              </a>
            ))}
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', background: '#111', padding: 4, borderRadius: 8, border: '1px solid #1e1e1e' }}>
            {['all', 'new', 'contacted', 'invited', 'approved'].map(s => (
              <a 
                key={s}
                href={`/admin/leads?type=${filters.type}&status=${s}`}
                style={{ 
                  padding: '6px 16px', 
                  fontSize: '0.85rem', 
                  borderRadius: 6, 
                  textDecoration: 'none',
                  background: filters.status === s ? '#222' : 'transparent',
                  color: filters.status === s ? '#fff' : '#666',
                  fontWeight: filters.status === s ? 700 : 400,
                  border: filters.status === s ? '1px solid #333' : '1px solid transparent'
                }}
              >
                {s.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary" 
          style={{ height: 44, padding: '0 24px', fontSize: '0.9rem', borderRadius: 10 }}
        >
          <T en="+ Add Seller Manually" ar="+ إضافة تاجر يدوياً" />
        </button>
      </div>

      {/* Table/List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {leads.map(lead => (
          <LeadRow 
            key={lead.id} 
            lead={lead} 
            isExpanded={expandedId === lead.id}
            onToggle={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
          />
        ))}
        {leads.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#444' }}>
            <T en="No applications found matching filters." ar="لا توجد طلبات تطابق الفلاتر المختارة." />
          </div>
        )}
      </div>

      {isModalOpen && <ManualEntryModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function LeadRow({ lead, isExpanded, onToggle }: { lead: any; isExpanded: boolean; onToggle: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (actionType: string) => {
    startTransition(async () => {
      if (actionType === 'contacted') {
        await markContacted(lead.id);
      } else if (actionType === 'approve') {
        await createProviderAccount(lead.id, lead.email, lead.type, lead.name);
      } else if (actionType === 'reject') {
        await rejectLead(lead.id);
      }
    });
  };

  return (
    <div style={{ background: '#111', borderRadius: 16, border: isExpanded ? '1px solid #cfa86e' : '1px solid #1e1e1e', overflow: 'hidden', transition: 'all 0.2s' }}>
      {/* Collapsed Header */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 1fr 1.2fr 120px 100px', alignItems: 'center', gap: 16 }}>
        <div>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: 6, 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            background: lead.type === 'seller' ? 'rgba(207, 168, 110, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: lead.type === 'seller' ? '#cfa86e' : '#3b82f6'
          }}>
            {lead.type?.toUpperCase()}
          </span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{lead.business_name}</div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 2 }}>{lead.business_name_ar || '—'}</div>
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600 }}>{lead.name}</div>
          <div style={{ color: '#555' }}>{lead.email}</div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>{lead.city}</div>
        <div style={{ fontSize: '0.85rem', color: '#555' }}>{new Date(lead.created_at).toLocaleDateString()}</div>
        <div>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: lead.status === 'new' ? '#eab308' : lead.status === 'approved' ? '#22c55e' : lead.status === 'invited' ? '#cfa86e' : '#666'
          }}>
            {lead.status?.toUpperCase()}
          </span>
        </div>
        <button 
          onClick={onToggle}
          style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {isExpanded ? <T en="Close" ar="إغلاق" /> : <T en="Details" ar="التفاصيل" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ background: '#0d0d0d', borderTop: '1px solid #1e1e1e', padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* PANEL LEFT: Info */}
          <div>
            <h4 style={{ color: '#cfa86e', marginBottom: 20, fontSize: '1rem' }}><T en="Application Details" ar="تفاصيل الطلب" /></h4>
            <div style={{ display: 'grid', gap: 16 }}>
              <InfoRow labelEn="Company (EN)" labelAr="اسم الشركة (EN)" value={lead.business_name} />
              <InfoRow labelEn="Company (AR)" labelAr="اسم الشركة (AR)" value={lead.business_name_ar} />
              <InfoRow labelEn="Contact Person" labelAr="اسم المسؤول" value={lead.name} />
              <InfoRow labelEn="Email" labelAr="البريد الإلكتروني" value={lead.email} />
              <InfoRow labelEn="Phone" labelAr="رقم الجوال" value={lead.phone} />
              <InfoRow labelEn="City" labelAr="المدينة" value={lead.city} />
              {lead.type === 'seller' && (
                <InfoRow labelEn="Categories" labelAr="الفئات" value={Array.isArray(lead.product_categories) ? lead.product_categories.join(', ') : lead.product_categories} />
              )}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 4 }}><T en="Notes / Message" ar="الملاحظات" /></div>
                <div style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>{lead.message || 'No notes provided.'}</div>
              </div>
            </div>
          </div>

          {/* PANEL RIGHT: Documents & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ color: '#cfa86e', marginBottom: 20, fontSize: '1rem' }}><T en="Review Documents" ar="مراجعة الوثائق" /></h4>
              <div style={{ display: 'grid', gap: 12 }}>
                <DocRow labelEn="Commercial Registration" labelAr="السجل التجاري" url={lead.cr_document_url} />
                <DocRow labelEn="VAT Certificate" labelAr="شهادة الضريبة" url={lead.vat_document_url} optional />
                <DocRow labelEn="National Address" labelAr="العنوان الوطني" url={lead.national_address_url} />
                <DocRow labelEn="Bank Document" labelAr="وثيقة البنك" url={lead.bank_document_url} />
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #222', display: 'flex', gap: 12 }}>
              {lead.status === 'new' && (
                <button 
                  onClick={() => handleAction('contacted')}
                  disabled={isPending}
                  className="btn" 
                  style={{ background: '#eab308', color: '#000', fontWeight: 700, padding: '0 24px', height: 44, borderRadius: 10 }}
                >
                  <T en="Mark Contacted" ar="تم التواصل" />
                </button>
              )}

              {lead.status === 'contacted' && (
                <>
                  <button 
                    onClick={() => handleAction('approve')}
                    disabled={isPending}
                    className="btn" 
                    style={{ background: '#cfa86e', color: '#000', fontWeight: 800, padding: '0 32px', height: 44, borderRadius: 10 }}
                  >
                    <T en="Approve & Send Invite" ar="اعتماد وإرسال الدعوة" />
                  </button>
                  <button 
                    onClick={() => handleAction('reject')}
                    disabled={isPending}
                    className="btn btn-danger" 
                    style={{ height: 44, padding: '0 20px', borderRadius: 10 }}
                  >
                    <T en="Reject" ar="رفض" />
                  </button>
                </>
              )}

              {lead.status === 'invited' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>Invited ✓</span>
                  <button 
                    onClick={() => handleAction('approve')}
                    disabled={isPending}
                    style={{ background: 'transparent', border: '1px solid #cfa86e', color: '#cfa86e', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <T en="Resend Invite" ar="إعادة إرسال الدعوة" />
                  </button>
                </div>
              )}

              {lead.status === 'approved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>Approved ✓</span>
                  <Link 
                    href={lead.type === 'seller' ? "/admin/vendors" : "/admin/studios"}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <T en="View Portal" ar="دخول البوابة" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ labelEn, labelAr, value }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', paddingBottom: 8 }}>
      <span style={{ fontSize: '0.8rem', color: '#555' }}><T en={labelEn} ar={labelAr} /></span>
      <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

function DocRow({ labelEn, labelAr, url, optional }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid #1e1e1e' }}>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}><T en={labelEn} ar={labelAr} /></div>
        {optional && <div style={{ fontSize: '0.7rem', color: '#555' }}>Optional</div>}
      </div>
      <div>
        {url ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700 }}>✓ Uploaded</span>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(207, 168, 110, 0.1)', color: '#cfa86e', textDecoration: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #cfa86e' }}>
              VIEW
            </a>
          </div>
        ) : (
          <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>✗ Missing</span>
        )}
      </div>
    </div>
  );
}

// Modal for manual entry
function ManualEntryModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      // Step 1: Upload Documents
      const crFile = formData.get('cr_file') as File;
      const vatFile = formData.get('vat_file') as File;
      const addressFile = formData.get('address_file') as File;
      const bankFile = formData.get('bank_file') as File;

      const upload = async (file: File | null, prefix: string) => {
        if (!file || file.size === 0) return null;
        const supabase = createClient();
        const path = `manual-entries/${Date.now()}-${file.name}`;
        await supabase.storage.from("provider-documents").upload(path, file);
        return supabase.storage.from("provider-documents").getPublicUrl(path).data.publicUrl;
      };

      const [crUrl, vatUrl, addressUrl, bankUrl] = await Promise.all([
        upload(crFile, 'cr'),
        upload(vatFile, 'vat'),
        upload(addressFile, 'address'),
        upload(bankFile, 'bank')
      ]);

      // Step 2: Create Lead & Account
      await createManualSeller({
        fullName: formData.get('full_name')?.toString() || '',
        businessNameEn: formData.get('business_name_en')?.toString() || '',
        businessNameAr: formData.get('business_name_ar')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        city: formData.get('city')?.toString() || '',
        type: formData.get('type')?.toString() || 'seller',
        notes: formData.get('notes')?.toString() || '',
        crUrl, vatUrl, addressUrl, bankUrl
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add seller.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#111', width: '100%', maxWidth: 700, borderRadius: 24, border: '1px solid #1e1e1e', maxHeight: '90vh', overflowY: 'auto', padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ margin: 0 }}><T en="Add New Seller Manually" ar="إضافة تاجر يدوياً" /></h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field labelEn="Full Name" labelAr="الاسم الكامل" name="full_name" required />
            <Field labelEn="Email" labelAr="البريد الإلكتروني" name="email" type="email" required />
            <Field labelEn="Phone" labelAr="رقم الجوال" name="phone" required />
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}><T en="City" ar="المدينة" /></label>
              <select className="input" name="city">
                <option value="Riyadh">Riyadh</option>
                <option value="Jeddah">Jeddah</option>
                <option value="Dammam">Dammam</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Field labelEn="Company Name (EN)" labelAr="اسم الشركة (EN)" name="business_name_en" required />
            <Field labelEn="Company Name (AR)" labelAr="اسم الشركة (AR)" name="business_name_ar" required />
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}><T en="Type" ar="النوع" /></label>
              <select className="input" name="type">
                <option value="seller">Seller / تاجر</option>
                <option value="studio">Studio / استوديو</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <DocInput labelEn="CR Document" labelAr="السجل التجاري" name="cr_file" required />
            <DocInput labelEn="VAT Document" labelAr="شهادة الضريبة" name="vat_file" />
            <DocInput labelEn="National Address" labelAr="العنوان الوطني" name="address_file" required />
            <DocInput labelEn="Bank Document" labelAr="وثيقة البنك" name="bank_file" required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#888' }}><T en="Notes" ar="ملاحظات" /></label>
            <textarea className="input" name="notes" style={{ minHeight: 80, paddingTop: 12 }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 54, borderRadius: 12 }} disabled={loading}>
            {loading ? "..." : <T en="Create Account & Invite" ar="إنشاء الحساب وإرسال الدعوة" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ labelEn, labelAr, ...props }: any) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: '0.85rem', color: '#888' }}><T en={labelEn} ar={labelAr} /></label>
      <input className="input" {...props} />
    </div>
  );
}

function DocInput({ labelEn, labelAr, required, name }: any) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: '0.85rem', color: '#888' }}><T en={labelEn} ar={labelAr} /> {required && '*'}</label>
      <input type="file" name={name} className="input" style={{ fontSize: '0.8rem', paddingTop: 8 }} required={required} />
    </div>
  );
}

// ---------------------------------------------------------
// SERVER ACTIONS
// ---------------------------------------------------------

async function markContacted(leadId: string) {
  "use server";
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  await supabaseAdmin.from("provider_leads").update({ status: 'contacted' }).eq('id', leadId);
  revalidatePath('/admin/leads');
}

async function rejectLead(leadId: string) {
  "use server";
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  await supabaseAdmin.from("provider_leads").update({ status: 'rejected' }).eq('id', leadId);
  revalidatePath('/admin/leads');
}

async function createProviderAccount(leadId: string, email: string, type: string, name: string) {
  "use server";
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  
  // 1. Generate temp password
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  
  // 2. Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name, provider_type: type }
  });

  if (authError) throw authError;

  // 3. Create Profile
  await supabaseAdmin.from("profiles").insert({
    auth_user_id: authData.user.id,
    email: email,
    full_name: name,
    role: type === 'seller' ? 'vendor' : 'owner',
    account_status: 'active'
  });

  // 4. Send Email
  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gearbeat.sa';

  await resend.emails.send({
    from: "GearBeat <noreply@gearbeat.sa>",
    to: email,
    subject: "مرحباً بك في GearBeat — بيانات دخولك",
    html: `
      <div dir="rtl" style="font-family: sans-serif; padding: 32px; background: #0a0a0a; color: #f5f1e8; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1e1e1e;">
        <h1 style="color: #cfa86e; font-size: 24px; border-bottom: 2px solid #222; padding-bottom: 16px;">مرحباً ${name}،</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #ccc;">تم قبول طلب انضمامك إلى GearBeat. يسعدنا تواجدك معنا كشريك نجاح.</p>
        <div style="background: #111; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #222;">
          <p style="margin: 0 0 12px; color: #888;">بيانات الدخول الخاصة بك:</p>
          <p style="margin: 0 0 8px; font-size: 18px;"><strong>البريد الإلكتروني:</strong> <span style="color: #fff;">${email}</span></p>
          <p style="margin: 0; font-size: 18px;"><strong>كلمة المرور المؤقتة:</strong> <span style="color: #cfa86e;">${tempPassword}</span></p>
        </div>
        <p style="color: #888; font-size: 14px;">ملاحظة: يرجى تغيير كلمة المرور فور تسجيل الدخول لأول مرة لضمان أمان حسابك.</p>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${siteUrl}/portal/login" 
             style="background: #cfa86e; color: #000; padding: 16px 40px; 
                    border-radius: 12px; text-decoration: none; font-weight: 800;
                    display: inline-block; font-size: 16px; box-shadow: 0 10px 20px rgba(207, 168, 110, 0.2);">
            دخول البوابة
          </a>
        </div>
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #222; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            GearBeat — STUDIO. SOUND. CONNECTED.
          </p>
        </div>
      </div>
    `
  });

  // 5. Update Lead
  await supabaseAdmin.from("provider_leads").update({ 
    status: 'invited', 
    invited_at: new Date().toISOString() 
  }).eq('id', leadId);

  revalidatePath('/admin/leads');
}

async function createManualSeller(data: any) {
  "use server";
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // 1. Insert Lead
  const { data: lead, error: leadError } = await supabaseAdmin.from("provider_leads").insert({
    name: data.fullName,
    business_name: data.businessNameEn,
    business_name_ar: data.businessNameAr,
    email: data.email,
    phone: data.phone,
    city: data.city,
    type: data.type,
    message: data.notes,
    status: 'contacted', // Added by admin
    cr_document_url: data.crUrl,
    vat_document_url: data.vatUrl,
    national_address_url: data.addressUrl,
    bank_document_url: data.bankUrl,
    created_at: new Date().toISOString()
  }).select().single();

  if (leadError) throw leadError;

  // 2. Trigger Account Creation
  await createProviderAccount(lead.id, data.email, data.type, data.fullName);
}
