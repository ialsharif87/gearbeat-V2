import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSellerContract } from "@/lib/contracts/seller-template";
import { generateStudioContract } from "@/lib/contracts/studio-template";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("[CONTRACT_GEN] Auth Error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CONTRACT_GEN] Generating for:", user.email);

    // 2. Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from("provider_leads")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    // 3. Fetch profile as fallback for name/role
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!lead && !profile) {
      return NextResponse.json({ error: "User profile or lead not found" }, { status: 404 });
    }

    const type = lead?.type || (profile?.role === "owner" ? "studio" : "seller");
    const contractDate = new Date().toLocaleDateString('ar-SA');
    
    const html = type === "studio"
      ? generateStudioContract({
          sellerNameAr: lead?.name || profile?.full_name || "Owner",
          sellerNameEn: lead?.name || profile?.full_name || "Owner",
          companyNameAr: lead?.business_name_ar || lead?.business_name || "Studio Name",
          companyNameEn: lead?.business_name || "Studio Name",
          email: lead?.email || user.email!,
          phone: lead?.phone || profile?.phone || "000",
          city: lead?.city || "Saudi Arabia",
          commissionPercent: lead?.commission_percent || 15,
          contractDate,
        })
      : generateSellerContract({
          sellerNameAr: lead?.name || profile?.full_name || "Seller",
          sellerNameEn: lead?.name || profile?.full_name || "Seller",
          companyNameAr: lead?.business_name_ar || lead?.business_name || "Company Name",
          companyNameEn: lead?.business_name || "Company Name",
          email: lead?.email || user.email!,
          phone: lead?.phone || profile?.phone || "000",
          city: lead?.city || "Saudi Arabia",
          commissionPercent: lead?.commission_percent || 15,
          contractDate,
        });

    const filename = type === "studio" ? "studio-agreement.doc" : "seller-agreement.doc";

    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Contract Generation Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
