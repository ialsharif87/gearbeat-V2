import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch customer orders
  const { data: orders } = await supabase
    .from("marketplace_orders")
    .select(`
      *,
      items:marketplace_order_items(
        id,
        quantity,
        total_price,
        product:marketplace_products(name_en, name_ar, slug)
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="section-padding">
      <div className="section-head">
        <h1><T en="My Gear Orders" ar="طلبات المعدات الخاصة بي" /></h1>
        <p><T en="Track your purchases and download invoices." ar="تتبع مشترياتك وقم بتحميل الفواتير." /></p>
      </div>

      <div style={{ marginTop: 40, display: 'grid', gap: 25 }}>
        {!orders || orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <p><T en="You haven't ordered any gear yet." ar="لم تقم بطلب أي معدات بعد." /></p>
            <Link href="/gear" className="btn btn-primary" style={{ marginTop: 20 }}>
              <T en="Browse Marketplace" ar="تصفح السوق" />
            </Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="card order-history-card">
              <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>
                    <T en="ORDER #" ar="رقم الطلب" />
                  </label>
                  <div style={{ fontWeight: 700 }}>#{order.order_number}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>
                    <T en="DATE" ar="التاريخ" />
                  </label>
                  <div>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>
                    <T en="TOTAL" ar="الإجمالي" />
                  </label>
                  <div style={{ color: 'var(--gb-gold)', fontWeight: 700 }}>{order.total_amount} SAR</div>
                </div>
                <div>
                  <span className={`badge badge-${order.status === 'delivered' ? 'success' : 'warning'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-items-list" style={{ display: 'grid', gap: 15 }}>
                {order.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <div>
                       <Link href={`/gear/products/${item.product?.slug}`} className="text-link">
                          {item.product?.name_en}
                       </Link>
                       <span style={{ color: 'var(--muted)', marginLeft: 10 }}>x{item.quantity}</span>
                    </div>
                    <span>{item.total_price} SAR</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
