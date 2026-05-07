import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import ContractUploader from "@/components/contract-uploader";

export default async function StudioDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch data
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    profileResult,
    studioAppResult,
    bookingsMonthResult,
    pendingBookingsResult,
    revenueResult,
    ratingResult,
    recentBookingsResult,
    studiosResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("studio_applications")
      .select("*")
      .eq("email", user.email)
      .maybeSingle(),

    // ... rest of queries

    supabase
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", { count: "exact", head: true })
      .eq("studios.owner_auth_user_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", { count: "exact", head: true })
      .eq("studios.owner_auth_user_id", user.id)
      .eq("status", "pending"),

    supabase
      .from("bookings")
      .select("total_amount, studios!inner(owner_auth_user_id)")
      .eq("studios.owner_auth_user_id", user.id)
      .eq("payment_status", "paid")
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("studio_reviews")
      .select("rating, studios!inner(owner_auth_user_id)")
      .eq("studios.owner_auth_user_id", user.id),

    supabase
      .from("bookings")
      .select(`
        id, 
        created_at, 
        total_amount, 
        status, 
        start_time,
        profiles:customer_id(full_name),
        studios(name)
      `)
      .eq("studios.owner_auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("studios")
      .select(`
        completion_score,
        certified_studios(
          status,
          studio_tiers(
            level,
            name_en,
            name_ar
          )
        ),
        merch_fulfillment_orders(
          status,
          kit_id
        )
      `)
      .eq("owner_auth_user_id", user.id)
      .order("completion_score", { ascending: false })
      .limit(1),
  ]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const studioApp = studioAppResult.data;
  const isFinalApproved = !!studioApp?.final_approved_at;

  // Fix: Check if lead has signed contract to bypass uploader
  const { data: leadData } = await supabase
    .from('provider_leads')
    .select('signed_contract_url')
    .eq('email', user.email)
    .maybeSingle();

  const isContractSigned = !!(leadData?.signed_contract_url || studioApp?.contract_url);

  if (studioApp && !isFinalApproved && !isContractSigned) {
    return (
      <main className="gb-dashboard-page container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>🚀</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 16 }}>
            <T en="Almost there!" ar="أوشكنا على الانتهاء!" />
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#888', lineHeight: 1.6, marginBottom: 48 }}>
            <T 
              en="Your application is approved. Now, please review your customized contract, sign it, and upload it here to activate your full dashboard." 
              ar="لقد تمت الموافقة على طلبك. الآن، يرجى مراجعة عقدك المخصص، توقيعه، ورفعه هنا لتفعيل لوحة التحكم الخاصة بك." 
            />
          </p>

          <div style={{ display: 'grid', gap: 32, textAlign: 'left' }}>
            {/* Step 1: Review Contract */}
            <div style={{ background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gb-gold)', marginBottom: 16 }}>
                1. <T en="Review Your Contract" ar="مراجعة العقد" />
              </h3>
              <div style={{ background: '#000', padding: 20, borderRadius: 12, fontSize: '0.9rem', color: '#ccc', maxHeight: 200, overflowY: 'auto', marginBottom: 20, whiteSpace: 'pre-wrap', border: '1px solid #1a1a1a' }}>
                {studioApp.contract_draft || "Your customized contract is being prepared..."}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                 <p style={{ fontSize: '0.85rem', color: '#888' }}>
                   <T en="Please use your browser's print function (Ctrl+P) to save the contract." ar="يرجى استخدام خاصية الطباعة في المتصفح (Ctrl+P) لحفظ العقد." />
                 </p>
              </div>
            </div>

            {/* Step 2: Upload */}
            <div style={{ background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gb-gold)', marginBottom: 16 }}>
                2. <T en="Upload Signed Contract" ar="رفع العقد الموقع" />
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20 }}>
                <T en="Please upload a scanned PDF or high-quality image of the signed contract." ar="يرجى رفع نسخة PDF ممسوحة ضوئياً أو صورة عالية الجودة للعقد الموقع." />
              </p>
              
              <ContractUploader appId={studioApp.id} currentUrl={studioApp.contract_url} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Original Dashboard Logic continues...
  const ownerName = profileResult.data?.full_name || user.email?.split("@")[0] || "User";
  const totalBookingsMonth = bookingsMonthResult.count || 0;
  const pendingBookings = pendingBookingsResult.count || 0;
  
  const totalRevenue = (revenueResult.data || []).reduce(
    (acc, b) => acc + (b.total_amount || 0), 
    0
  );

  const ratings = ratingResult.data || [];
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "5.0";

  const recentBookings = recentBookingsResult.data || [];
  const studioData = studiosResult.data?.[0] as any;
  const studioScore = studioData?.completion_score || 0;
  const cert = studioData?.certified_studios?.[0];
  const tier = cert?.studio_tiers;
  const kitOrder = studioData?.merch_fulfillment_orders?.[0];

  // Render the view
  return (
    <StudioDashboardView 
      ownerName={ownerName}
      totalBookingsMonth={totalBookingsMonth}
      pendingBookings={pendingBookings}
      totalRevenue={totalRevenue}
      avgRating={avgRating}
      recentBookings={recentBookings}
      tier={tier}
      cert={cert}
      formatDate={formatDate}
      formatTime={formatTime}
    />
  );
}

// Separate import for the view
import StudioDashboardView from "@/components/studio-dashboard-view";
