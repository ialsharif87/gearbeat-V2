import Link from "next/link";
import { notFound } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  
  if (!bookingId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      booking_date,
      start_time,
      end_time,
      total_amount,
      notes,
      created_at,
      studio:studios(
        name,
        slug,
        cover_image_url,
        city
      )
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return (
      <main className="dashboard-page" style={{ maxWidth: 600, margin: "100px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 40 }}>
          <h2 style={{ marginBottom: 16 }}>
            <T en="Booking Not Found" ar="لم يتم العثور على الحجز" />
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            <T en="We couldn't retrieve the details for this booking." ar="لم نتمكن من استرداد تفاصيل هذا الحجز." />
          </p>
          <Link href="/studios" className="btn btn-primary">
            <T en="Back to Studios" ar="العودة للاستوديوهات" />
          </Link>
        </div>
      </main>
    );
  }

  const studio = Array.isArray(booking.studio) ? booking.studio[0] : booking.studio;
  const bookingRef = booking.id.slice(0, 8).toUpperCase();

  return (
    <main className="dashboard-page" style={{ maxWidth: 600, margin: "60px auto" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden", textAlign: "center" }}>
        {/* Success Header */}
        <div style={{ 
          background: "linear-gradient(135deg, var(--gb-gold) 0%, #b8860b 100%)", 
          padding: "40px 20px",
          color: "black"
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: "rgba(255,255,255,0.9)", 
            borderRadius: "50%", 
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem"
          }}>
            ✓
          </div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>
            <T en="Booking Confirmed!" ar="تم تأكيد الحجز!" />
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.8, fontSize: "0.9rem", fontWeight: 600 }}>
            <T en="Reference:" ar="المرجع:" /> #{bookingRef}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 30px" }}>
          <div style={{ marginBottom: 30 }}>
            {studio?.cover_image_url && (
              <img 
                src={studio.cover_image_url} 
                alt={studio.name} 
                style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", marginBottom: 16 }}
              />
            )}
            <h2 style={{ fontSize: "1.4rem", margin: "0 0 4px" }}>{studio?.name || "Studio Session"}</h2>
            <p style={{ color: "var(--muted)", margin: 0 }}>{studio?.city || "Saudi Arabia"}</p>
          </div>

          <div style={{ 
            display: "grid", 
            gap: 20, 
            textAlign: "left", 
            padding: "24px", 
            background: "rgba(255,255,255,0.03)", 
            borderRadius: 16,
            marginBottom: 30
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}><T en="Date" ar="التاريخ" /></span>
              <strong style={{ fontSize: "1rem" }}>{formatDate(booking.booking_date)}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}><T en="Time" ar="الوقت" /></span>
              <strong style={{ fontSize: "1rem" }}>{booking.start_time} - {booking.end_time}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}><T en="Total Paid" ar="إجمالي المبلغ" /></span>
              <strong style={{ fontSize: "1.2rem", color: "var(--gb-gold)" }}>{Number(booking.total_amount).toFixed(2)} SAR</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}><T en="Status" ar="الحالة" /></span>
              <span className="badge badge-success" style={{ textTransform: "uppercase" }}>{booking.status}</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <Link href="/customer/bookings" className="btn btn-primary btn-large">
              <T en="View My Bookings" ar="عرض حجوزاتي" />
            </Link>
            <Link href="/studios" className="btn btn-secondary">
              <T en="Back to Studios" ar="العودة للاستوديوهات" />
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "0.85rem", color: "var(--muted)" }}>
          <T 
            en="A confirmation email has been sent to your registered address." 
            ar="تم إرسال بريد إلكتروني للتأكيد إلى عنوانك المسجل." 
          />
        </div>
      </div>
    </main>
  );
}
