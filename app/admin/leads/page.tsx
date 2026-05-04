import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Resend } from "resend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; status?: string; modal?: string }>;
}) {
  await requireAdminLayoutAccess();
  const params = searchParams ? await searchParams : {};
  const typeFilter = params.type || "all";
  const statusFilter = params.status || "all";
  const showModal = params.modal === "manual";

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

  const { data: leads } = await query;

  // Stats calculation
  const { data: allLeads } = await supabase.from("provider_leads").select("status");
  const stats = {
    total: allLeads?.length || 0,
    new: allLeads?.filter(l => l.status === 'new').length || 0,
    contacted: allLeads?.filter(l => l.status === 'contacted').length || 0,
    invited: allLeads?.filter(l => l.status === 'invited').length || 0,
    approved: allLeads?.filter(l => l.status === 'approved').length || 0,
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
            <T en="Provider Applications" ar="طلبات المزودين" />
          </h1>
          <p style={{ color: '#888', marginTop: 8 }}>
            <T en="Manage and review seller and studio onboarding requests." ar="إدارة ومراجعة طلبات انضمام التجار والاستوديوهات." />
          </p>
        </div>
        <Link 
          href={`/admin/leads?type=${typeFilter}&status=${statusFilter}&modal=manual`}
          className="btn btn-primary" 
          style={{ height: 44, padding: '0 24px', fontSize: '0.9rem', borderRadius: 10, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <T en="+ Add Seller Manually" ar="+ إضافة تاجر يدوياً" />
        </Link>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard labelEn="Total" labelAr="الإجمالي" value={stats.total} />
        <StatCard labelEn="New" labelAr="جديد" value={stats.new} color="#eab308" />
        <StatCard labelEn="Contacted" labelAr="تم التواصل" value={stats.contacted} color="#3b82f6" />
        <StatCard labelEn="Invited" labelAr="تمت الدعوة" value={stats.invited} color="#cfa86e" />
        <StatCard labelEn="Approved" labelAr="معتمد" value={stats.approved} color="#22c55e" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', background: '#111', padding: 4, borderRadius: 8, border: '1px solid #1e1e1e' }}>
          {['all', 'seller', 'studio'].map(t => (
            <Link 
              key={t}
              href={`/admin/leads?type=${t}&status=${statusFilter}`}
              style={{ 
                padding: '6px 16px', fontSize: '0.85rem', borderRadius: 6, textDecoration: 'none',
                background: typeFilter === t ? '#cfa86e' : 'transparent',
                color: typeFilter === t ? '#000' : '#888',
                fontWeight: typeFilter === t ? 700 : 400
              }}
            >
              {t.toUpperCase()}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', background: '#111', padding: 4, borderRadius: 8, border: '1px solid #1e1e1e' }}>
          {['all', 'new', 'contacted', 'invited', 'approved'].map(s => (
            <Link 
              key={s}
              href={`/admin/leads?type=${typeFilter}&status=${s}`}
              style={{ 
                padding: '6px 16px', fontSize: '0.85rem', borderRadius: 6, textDecoration: 'none',
                background: statusFilter === s ? '#222' : 'transparent',
                color: statusFilter === s ? '#fff' : '#666',
                fontWeight: statusFilter === s ? 700 : 400
              }}
            >
              {s.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {leads?.map(lead => (
          <details key={lead.id} className="lead-details" style={{ background: '#111', borderRadius: 16, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
            <summary style={{ padding: '20px 24px', listStyle: 'none', cursor: 'pointer', outline: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 1fr 1.2fr 120px 40px', alignItems: 'center', gap: 16 }}>
                <div>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, 
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
                    fontSize: '0.75rem', fontWeight: 700, 
                    color: lead.status === 'new' ? '#eab308' : lead.status === 'approved' ? '#22c55e' : lead.status === 'invited' ? '#cfa86e' : '#666'
                  }}>
                    {lead.status?.toUpperCase()}
                  </span>
                </div>
                <div style={{ textAlign: 'right', opacity: 0.3 }}>▼</div>
              </div>
            </summary>

            <div style={{ background: '#0d0d0d', borderTop: '1px solid #1e1e1e', padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              {/* Info */}
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

              {/* Documents & Actions */}
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

                <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #222', display: 'flex', gap: 12 }}>
                  {lead.status === 'new' && (
                    <form action={markContactedAction}>
                      <input type="hidden" name="id" value={lead.id} />
                      <button className="btn" style={{ background: '#eab308', color: '#000', fontWeight: 700, padding: '0 24px', height: 44, borderRadius: 10 }}>
                        <T en="Mark Contacted" ar="تم التواصل" />
                      </button>
                    </form>
                  )}
                  {lead.status === 'contacted' && (
                    <>
                      <form action={createAccountAction} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <input type="hidden" name="id" value={lead.id} />
                        <input type="hidden" name="email" value={lead.email} />
                        <input type="hidden" name="type" value={lead.type} />
                        <input type="hidden" name="name" value={lead.name} />
                        
                        <div style={{ display: 'grid', gap: 4 }}>
                          <label style={{ fontSize: '0.7rem', color: '#666' }}>
                            <T en="Commission %" ar="العمولة %" />
                          </label>
                          <input 
                            name="commission" 
                            type="number" 
                            defaultValue={15} 
                            min={5} 
                            max={30} 
                            className="input" 
                            style={{ width: 80, height: 44, textAlign: 'center' }} 
                          />
                        </div>

                        <button className="btn" style={{ background: '#cfa86e', color: '#000', fontWeight: 800, padding: '0 32px', height: 44, borderRadius: 10 }}>
                          <T en="Approve & Send Invite" ar="اعتماد وإرسال الدعوة" />
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <input type="hidden" name="id" value={lead.id} />
                        <button className="btn btn-danger" style={{ height: 44, padding: '0 20px', borderRadius: 10 }}>
                          <T en="Reject" ar="رفض" />
                        </button>
                      </form>
                    </>
                  )}
                  {lead.status === 'invited' && <span style={{ color: '#22c55e', fontWeight: 700 }}>Invited ✓</span>}
                  {lead.status === 'approved' && <span style={{ color: '#3b82f6', fontWeight: 700 }}>Approved ✓</span>}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#111', width: '100%', maxWidth: 700, borderRadius: 24, border: '1px solid #1e1e1e', padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
              <h2 style={{ margin: 0 }}><T en="Add Seller Manually" ar="إضافة تاجر يدوياً" /></h2>
              <Link href={`/admin/leads?type=${typeFilter}&status=${statusFilter}`} style={{ color: '#888', textDecoration: 'none', fontSize: '1.5rem' }}>×</Link>
            </div>
            <form action={manualCreateAction} style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input labelEn="Full Name" labelAr="الاسم الكامل" name="full_name" required />
                <Input labelEn="Email" labelAr="البريد الإلكتروني" name="email" type="email" required />
                <Input labelEn="Phone" labelAr="رقم الجوال" name="phone" required />
                <div style={{ display: 'grid', gap: 4 }}>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}><T en="City" ar="المدينة" /></label>
                  <select className="input" name="city">
                    <option value="Riyadh">Riyadh</option>
                    <option value="Jeddah">Jeddah</option>
                    <option value="Dammam">Dammam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input labelEn="Business (EN)" labelAr="اسم المنشأة (EN)" name="name_en" required />
                <Input labelEn="Business (AR)" labelAr="اسم المنشأة (AR)" name="name_ar" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 54, borderRadius: 12 }}>
                <T en="Create Lead" ar="إنشاء الطلب" />
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lead-details[open] summary { border-bottom: 1px solid #1e1e1e; }
        .lead-details summary::-webkit-details-marker { display: none; }
      `}} />
    </main>
  );
}

function StatCard({ labelEn, labelAr, value, color }: any) {
  return (
    <div style={{ background: '#111', padding: '16px 24px', borderRadius: 12, border: '1px solid #1e1e1e' }}>
      <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}><T en={labelEn} ar={labelAr} /></div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#fff' }}>{value}</div>
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
      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}><T en={labelEn} ar={labelAr} /></div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>✓ VIEW</a>
      ) : (
        <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>{optional ? 'OPTIONAL' : '✗ MISSING'}</span>
      )}
    </div>
  );
}

function Input({ labelEn, labelAr, name, type = "text", required }: any) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <label style={{ fontSize: '0.8rem', color: '#666' }}><T en={labelEn} ar={labelAr} /></label>
      <input className="input" name={name} type={type} required={required} />
    </div>
  );
}

// Server Actions
async function markContactedAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  await supabaseAdmin.from("provider_leads").update({ status: 'contacted' }).eq('id', id);
  revalidatePath('/admin/leads');
}

async function rejectAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  await supabaseAdmin.from("provider_leads").update({ status: 'rejected' }).eq('id', id);
  revalidatePath('/admin/leads');
}

async function createAccountAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const email = formData.get("email")?.toString();
  const type = formData.get("type")?.toString();
  const name = formData.get("name")?.toString();
  const commission = formData.get("commission")?.toString() || "15";
  if (!id || !email) return;

  const { supabaseAdmin } = await requireAdminLayoutAccess();
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password: tempPassword, email_confirm: true,
    user_metadata: { full_name: name, provider_type: type }
  });

  if (authError) throw authError;

  await supabaseAdmin.from("profiles").insert({
    auth_user_id: authData.user.id, email, full_name: name,
    role: type === 'seller' ? 'vendor' : 'owner', account_status: 'active'
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "GearBeat <noreply@gearbeat.sa>",
    to: email,
    subject: "بيانات دخولك إلى GearBeat",
    html: `<div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
      <h2 style="color: #cfa86e;">مرحباً ${name}</h2>
      <p>تم قبول طلبك. بيانات دخولك:</p>
      <div style="background: #111; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p>البريد: ${email}<br/>كلمة المرور: ${tempPassword}</p>
        <p style="color: #cfa86e;">نسبة العمولة المتفق عليها: ${commission}%</p>
      </div>
      <p>يمكنك عرض العقد الرسمي الخاص بك عبر الرابط التالي:</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/login" style="background:#cfa86e; color:#000; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">دخول البوابة وتوقيع العقد</a>
      <p style="font-size: 12px; color: #666; margin-top: 20px;">يرجى تغيير كلمة المرور فور دخولك لأول مرة.</p>
    </div>`
  });

  await supabaseAdmin.from("provider_leads").update({ 
    status: 'invited', 
    invited_at: new Date().toISOString(),
    commission_percent: parseInt(commission)
  }).eq('id', id);
  
  revalidatePath('/admin/leads');
}

async function manualCreateAction(formData: FormData) {
  "use server";
  const { supabaseAdmin } = await requireAdminLayoutAccess();
  await supabaseAdmin.from("provider_leads").insert({
    name: formData.get("full_name"),
    business_name: formData.get("name_en"),
    business_name_ar: formData.get("name_ar"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    type: "seller",
    status: 'contacted',
    created_at: new Date().toISOString()
  });
  revalidatePath('/admin/leads');
  redirect('/admin/leads');
}
