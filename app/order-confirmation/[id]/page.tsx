import T from "../../../components/t";
import Link from "next/link";

export default async function OrderConfirmationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="section-padding" style={{ textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: 30 }}>
        ✓
      </div>
      
      <span className="badge badge-success">
        <T en="Order Confirmed" ar="تم تأكيد الطلب" />
      </span>
      
      <h1 style={{ marginTop: 20 }}>
        <T en="Thank you for your order!" ar="شكراً لطلبك!" />
      </h1>
      
      <p style={{ maxWidth: 500, margin: '15px auto', color: 'var(--muted)' }}>
        <T 
          en="Your order has been placed successfully. We have sent a confirmation email with all the details." 
          ar="تم إرسال طلبك بنجاح. لقد أرسلنا بريداً إلكترونياً لتأكيد الطلب مع كافة التفاصيل." 
        />
      </p>
      
      <div className="card" style={{ marginTop: 30, padding: '20px 40px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
          <T en="Order ID" ar="رقم الطلب" />
        </label>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em' }}>#{id}</div>
      </div>
      
      <div style={{ marginTop: 40, display: 'flex', gap: 15 }}>
        <Link href="/account/orders" className="btn btn-primary">
          <T en="Track Order" ar="تتبع الطلب" />
        </Link>
        <Link href="/gear" className="btn btn-secondary">
          <T en="Continue Shopping" ar="مواصلة التسوق" />
        </Link>
      </div>
    </div>
  );
}
