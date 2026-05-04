import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSellerContract } from "@/lib/contracts/seller-template";
import { generateStudioContract } from "@/lib/contracts/studio-template";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Fetch lead data
    const { data: lead } = await supabase
      .from("provider_leads")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const type = lead.type;
    const contractDate = new Date().toLocaleDateString('ar-SA');
    
    const html = type === "studio"
      ? generateStudioContract({
          sellerNameAr: lead.name, // Using lead.name as sellerNameAr
          sellerNameEn: lead.name,
          companyNameAr: lead.business_name_ar || lead.business_name,
          companyNameEn: lead.business_name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          commissionPercent: lead.commission_percent || 15,
          contractDate,
        })
      : generateSellerContract({
          sellerNameAr: lead.name,
          sellerNameEn: lead.name,
          companyNameAr: lead.business_name_ar || lead.business_name,
          companyNameEn: lead.business_name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          commissionPercent: lead.commission_percent || 15,
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
