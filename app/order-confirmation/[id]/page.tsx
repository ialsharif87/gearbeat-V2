import T from "../../../components/t";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function OrderConfirmationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("marketplace_orders")
    .select(`
      *,
      items:marketplace_order_items(*)
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    // If not found by UUID, try by order_number
    const { data: orderByNum } = await supabase
      .from("marketplace_orders")
      .select(`
        *,
        items:marketplace_order_items(*)
      `)
      .eq("order_number", id)
      .maybeSingle();
    
    if (!orderByNum) return notFound();
    return <OrderDetails order={orderByNum} />;
  }

  return <OrderDetails order={order} />;
}

function OrderDetails({ order }: { order: any }) {
  return (
    <div className="section-padding" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 25px' }}>
          ✓
        </div>
        
        <span className="badge badge-success">
          <T en="Order Confirmed" ar="تم تأكيد الطلب" />
        </span>
        
        <h1 style={{ marginTop: 20, fontSize: '2.5rem' }}>
          <T en="Thank you for your order!" ar="شكراً لطلبك!" />
        </h1>
        
        <p style={{ maxWidth: 500, margin: '15px auto', color: 'var(--muted)', fontSize: '1.1rem' }}>
          <T 
            en={`Your order #${order.order_number} has been placed successfully. You can track it in your dashboard.`} 
            ar={`تم إرسال طلبك رقم #${order.order_number} بنجاح. يمكنك تتبعه من خلال لوحة التحكم الخاصة بك.`} 
          />
        </p>
      </div>
      
      <div className="grid grid-2" style={{ gap: 30, alignItems: 'start' }}>
        <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ marginBottom: 20 }}><T en="Order Items" ar="منتجات الطلب" /></h3>
          <div style={{ display: 'grid', gap: 15 }}>
            {order.items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  {item.product_snapshot?.images?.[0] && (
                    <img src={item.product_snapshot.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.product_snapshot?.name_en || 'Product'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.quantity} x {item.unit_price} {item.currency_code}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{item.line_total} {item.currency_code}</div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 25, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <T en="Subtotal" ar="المجموع" />
              <span>{order.subtotal_amount} {order.currency_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: 5, color: 'var(--gb-gold)' }}>
              <T en="Total Paid" ar="الإجمالي المدفوع" />
              <span>{order.total_amount} {order.currency_code}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: 15 }}><T en="Order Details" ar="تفاصيل الطلب" /></h4>
            <div style={{ display: 'grid', gap: 10, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Status" ar="الحالة" /></span>
                <span className="badge">{order.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Date" ar="التاريخ" /></span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Payment" ar="الدفع" /></span>
                <span>{order.payment_status}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15 }}>
            <Link href="/customer/marketplace-orders" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
              <T en="Track Order" ar="تتبع الطلب" />
            </Link>
            <Link href="/gear" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              <T en="Continue Shopping" ar="مواصلة التسوق" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
