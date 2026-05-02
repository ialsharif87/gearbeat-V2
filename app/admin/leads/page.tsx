import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  
  return `${d}/${m}/${y}`;
}

async function markAsContacted(formData: FormData) {
  "use server";
  
  const leadId = formData.get("leadId")?.toString();
  if (!leadId) return;

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("provider_leads")
    .update({ status: "contacted" })
    .eq("id", leadId);

  revalidatePath("/admin/leads");
}

async function sendProviderInviteAction(formData: FormData) {
  "use server";
  
  const leadId = formData.get("leadId")?.toString();
  const email = formData.get("email")?.toString();
  const type = formData.get("type")?.toString();

  if (!leadId || !email || !type) return;

  const supabaseAdmin = createAdminClient();
  
  // 1. Generate magic link
  const redirectTo = type === "studio" 
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gearbeat.sa'}/portal/studio/onboarding`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gearbeat.sa'}/portal/store/onboarding`;

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: email,
    options: { redirectTo }
  });

  if (linkError) {
    console.error("Link generation error:", linkError);
    return;
  }

  const magicLink = linkData.properties.action_link;

  // 2. Send email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = type === "studio" ? "Your GearBeat Studio Portal Invitation" : "Your GearBeat Seller Portal Invitation";

  await resend.emails.send({
    from: "GearBeat <noreply@gearbeat.sa>",
    to: email,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
        <h1 style="color: #cfa762; font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 10px;">GearBeat</h1>
        <div style="margin-top: 30px; text-align: center;">
          <h2 style="font-size: 20px; color: #333;">تم قبول طلبك في GearBeat</h2>
          <h2 style="font-size: 20px; color: #333;">Your application has been approved</h2>
          <p style="color: #666; margin: 20px 0 30px;">Please use the button below to access your portal and complete your onboarding.</p>
          <a href="${magicLink}" style="background-color: #cfa762; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Access Your Portal / ادخل إلى بوابتك
          </a>
        </div>
        <div style="margin-top: 50px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          &copy; ${new Date().getFullYear()} GearBeat. All rights reserved.
        </div>
      </div>
    `
  });

  // 3. Update lead status
  await supabaseAdmin
    .from("provider_leads")
    .update({ 
      status: "invited",
      invited_at: new Date().toISOString()
    })
    .eq("id", leadId);

  revalidatePath("/admin/leads");
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  await requireAdminLayoutAccess();
  const params = await searchParams;
  const typeFilter = params.type || "all";
  const statusFilter = params.status || "all";

  const supabase = await createClient();
  let query = supabase.from("provider_leads").select("*").order("created_at", { ascending: false });

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }
  
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>
        <h1>
          <T en="Provider Leads" ar="طلبات المزودين" />
        </h1>
        <p>
          <T
            en="Review interest forms submitted by potential studio owners and vendors."
            ar="مراجعة طلبات الاهتمام المقدمة من أصحاب الاستوديوهات والبائعين المحتملين."
          />
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Type:</span>
          <Link href="/admin/leads?type=all&status=" className={`btn btn-small ${typeFilter === "all" ? "btn-primary" : "btn-secondary"}`}>
            All
          </Link>
          <Link href={`/admin/leads?type=studio&status=${statusFilter}`} className={`btn btn-small ${typeFilter === "studio" ? "btn-primary" : "btn-secondary"}`}>
            Studio
          </Link>
          <Link href={`/admin/leads?type=seller&status=${statusFilter}`} className={`btn btn-small ${typeFilter === "seller" ? "btn-primary" : "btn-secondary"}`}>
            Seller
          </Link>
        </div>

        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Status:</span>
          <Link href={`/admin/leads?type=${typeFilter}&status=all`} className={`btn btn-small ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}>
            All
          </Link>
          <Link href={`/admin/leads?type=${typeFilter}&status=new`} className={`btn btn-small ${statusFilter === "new" ? "btn-primary" : "btn-secondary"}`}>
            New
          </Link>
          <Link href={`/admin/leads?type=${typeFilter}&status=contacted`} className={`btn btn-small ${statusFilter === "contacted" ? "btn-primary" : "btn-secondary"}`}>
            Contacted
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Business Name</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Message</th>
                <th>Status</th>
                <th>Invited At</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!leads || leads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                    <T en="No leads found." ar="لا توجد طلبات." />
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id}>
                    <td>
                      <span className={`badge ${lead.type === "studio" ? "badge-blue" : "badge-gold"}`} style={lead.type === "studio" ? { backgroundColor: "#3b82f6", color: "white" } : {}}>
                        {lead.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{lead.business_name}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.city}</td>
                    <td title={lead.message} style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lead.message || "—"}
                    </td>
                    <td>
                      <span className={`badge badge-${lead.status === "new" ? "warning" : lead.status === "invited" ? "success" : "info"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{lead.invited_at ? formatDate(lead.invited_at) : "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(lead.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(lead.status === "new" || lead.status === "contacted") && (
                          <form action={markAsContacted}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <button type="submit" className="btn btn-small" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                              Mark Contacted
                            </button>
                          </form>
                        )}
                        
                        {lead.status === "contacted" && (
                          <form action={sendProviderInviteAction}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <input type="hidden" name="email" value={lead.email} />
                            <input type="hidden" name="type" value={lead.type} />
                            <button type="submit" className="btn btn-small" style={{ fontSize: "0.7rem", padding: "4px 8px", backgroundColor: "var(--gb-gold)", color: "black", borderColor: "var(--gb-gold)" }}>
                              Send Invite
                            </button>
                          </form>
                        )}

                        {lead.status === "invited" && (
                          <span style={{ color: "#00ff88", fontSize: "0.85rem", fontWeight: 600 }}>Invited ✓</span>
                        )}

                        {lead.status === "approved" && (
                          <span style={{ color: "#3b82f6", fontSize: "0.85rem", fontWeight: 600 }}>Approved</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .badge-blue { background-color: var(--gb-blue, #3b82f6); color: white; }
        .badge-gold { background-color: var(--gb-gold, #cfa762); color: black; }
      `}} />
    </section>
  );
}
