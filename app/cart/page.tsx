"use client";

import { useCart } from "../../context/cart-context";
import T from "../../components/t";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, totalItems, totalPrice } = useCart();

  if (totalItems === 0) {
    return (
      <div className="section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛒</div>
        <h1><T en="Your cart is empty" ar="سلتك فارغة" /></h1>
        <p><T en="Looks like you haven't added any gear yet." ar="يبدو أنك لم تضف أي معدات بعد." /></p>
        <div style={{ marginTop: 30 }}>
          <Link href="/gear" className="btn btn-primary">
            <T en="Start Shopping" ar="ابدأ التسوق" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="section-head">
        <span className="badge">
          <T en="Shopping Cart" ar="سلة التسوق" />
        </span>
        <h1><T en="Your Gear" ar="معداتك" /> ({totalItems})</h1>
      </div>

      <div className="grid grid-checkout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, marginTop: 40 }}>
        {/* ITEMS LIST */}
        <div className="cart-items-list">
          {items.map((item) => (
            <div key={item.id} className="card cart-item-card" style={{ display: 'flex', gap: 20, marginBottom: 20, padding: 20 }}>
              <div className="cart-item-image" style={{ width: 100, height: 100, background: 'white', borderRadius: 12, overflow: 'hidden', padding: 10 }}>
                <img src={item.image} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>{item.name_en}</h3>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{item.price} SAR</div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{item.name_ar}</p>
                <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="quantity-control">
                    <T en="Qty:" ar="الكمية:" /> <strong>{item.quantity}</strong>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-link" style={{ color: '#ff4d4d' }}>
                    <T en="Remove" ar="إزالة" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="cart-summary">
          <div className="card sticky-card" style={{ position: 'sticky', top: 100 }}>
            <h3><T en="Order Summary" ar="ملخص الطلب" /></h3>
            <div style={{ marginTop: 20, display: 'grid', gap: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Subtotal" ar="المجموع الفرعي" /></span>
                <span>{totalPrice} SAR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Shipping" ar="الشحن" /></span>
                <span style={{ color: '#00ff88' }}><T en="Calculated at checkout" ar="يُحسب عند الدفع" /></span>
              </div>
              <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 700 }}>
                <span><T en="Total" ar="الإجمالي" /></span>
                <span style={{ color: 'var(--gb-gold)' }}>{totalPrice} SAR</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                <T en="Inclusive of VAT" ar="شامل ضريبة القيمة المضافة" />
              </p>
              <Link href="/checkout" className="btn btn-primary btn-large w-full" style={{ marginTop: 10 }}>
                <T en="Proceed to Checkout" ar="المتابعة للدفع" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
