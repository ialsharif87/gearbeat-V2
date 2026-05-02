import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import Link from "next/link";

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
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!leads || leads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
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
                      <span className={`badge badge-${lead.status === "new" ? "warning" : "success"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(lead.created_at)}</td>
                    <td>
                      {lead.status === "new" && (
                        <form action={markAsContacted}>
                          <input type="hidden" name="leadId" value={lead.id} />
                          <button type="submit" className="btn btn-small" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                            Mark Contacted
                          </button>
                        </form>
                      )}
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
