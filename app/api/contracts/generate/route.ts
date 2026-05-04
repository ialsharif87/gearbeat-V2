import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSellerContract } from "@/lib/contracts/seller-template";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      sellerNameAr,
      sellerNameEn,
      companyNameAr,
      companyNameEn,
      email,
      phone,
      city,
      commissionPercent = 15,
    } = body;

    const contractDate = new Date().toLocaleDateString('ar-SA');
    
    const html = generateSellerContract({
      sellerNameAr,
      sellerNameEn,
      companyNameAr,
      companyNameEn,
      email,
      phone,
      city,
      commissionPercent,
      contractDate,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Contract Generation Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
