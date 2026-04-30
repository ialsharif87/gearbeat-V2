"use client";

import { useCart } from "../../context/cart-context";
import T from "../../components/t";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="section-padding" style={{ textAlign: 'center' }}>
         <Link href="/gear" className="btn btn-primary"><T en="Your cart is empty. Go back." ar="سلتك فارغة. عد للتسوق." /></Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real implementation, we would call a Server Action here to:
    // 1. Create a record in marketplace_orders
    // 2. Create records in marketplace_order_items
    // 3. Subtract inventory
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      clearCart();
      router.push("/order-confirmation/DEMO-ORDER-123");
    }, 2000);
  };

  return (
    <div className="section-padding">
      <div className="section-head">
        <h1><T en="Checkout" ar="إتمام الطلب" /></h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, marginTop: 40 }}>
        {/* SHIPPING & BILLING */}
        <div style={{ display: 'grid', gap: 30 }}>
          <div className="card">
            <h3><T en="Shipping Information" ar="معلومات الشحن" /></h3>
            <div style={{ marginTop: 20, display: 'grid', gap: 20 }}>
              <div className="grid grid-2">
                <div>
                  <label><T en="First Name" ar="الاسم الأول" /></label>
                  <input className="input" required placeholder="Ahmed" />
                </div>
                <div>
                  <label><T en="Last Name" ar="الاسم الأخير" /></label>
                  <input className="input" required placeholder="Al-Sharif" />
                </div>
              </div>
              <div>
                <label><T en="Street Address" ar="عنوان الشارع" /></label>
                <input className="input" required placeholder="King Fahd Road, Al Olaya" />
              </div>
              <div className="grid grid-3">
                <div>
                  <label><T en="City" ar="المدينة" /></label>
                  <input className="input" required placeholder="Riyadh" />
                </div>
                <div>
                  <label><T en="Region" ar="المنطقة" /></label>
                  <input className="input" required placeholder="Riyadh Region" />
                </div>
                <div>
                  <label><T en="Postal Code" ar="الرمز البريدي" /></label>
                  <input className="input" required placeholder="12211" />
                </div>
              </div>
              <div>
                <label><T en="Phone Number" ar="رقم الجوال" /></label>
                <input className="input" required placeholder="+966 5XXXXXXXX" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3><T en="Payment Method" ar="طريقة الدفع" /></h3>
            <div style={{ marginTop: 20, display: 'grid', gap: 15 }}>
              <label className="card payment-option active" style={{ display: 'flex', gap: 15, padding: 20, cursor: 'pointer', border: '2px solid var(--gb-gold)', background: 'rgba(199,164,93,0.05)' }}>
                <input type="radio" name="payment" defaultChecked />
                <div>
                  <strong><T en="Credit / Mada Card" ar="بطاقة ائتمان / مدى" /></strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}><T en="Secure payment via GearBeat Gateway" ar="دفع آمن عبر بوابة GearBeat" /></p>
                </div>
              </label>
              <label className="card payment-option" style={{ display: 'flex', gap: 15, padding: 20, opacity: 0.5, cursor: 'not-allowed' }}>
                <input type="radio" name="payment" disabled />
                <div>
                  <strong><T en="Apple Pay" ar="أبل باي" /></strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}><T en="Coming Soon" ar="قريباً" /></p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="checkout-summary">
          <div className="card sticky-card">
            <h3><T en="Order Summary" ar="ملخص الطلب" /></h3>
            <div style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto', display: 'grid', gap: 10 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{item.quantity}x {item.name_en}</span>
                  <span>{item.price * item.quantity} SAR</span>
                </div>
              ))}
            </div>
            <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <T en="Subtotal" ar="المجموع" />
                <span>{totalPrice} SAR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <T en="Shipping" ar="الشحن" />
                <span style={{ color: '#00ff88' }}><T en="FREE" ar="مجاني" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, marginTop: 10 }}>
                <T en="Total" ar="الإجمالي" />
                <span style={{ color: 'var(--gb-gold)' }}>{totalPrice} SAR</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-large w-full" style={{ marginTop: 30 }} disabled={loading}>
              {loading ? <T en="Processing..." ar="جاري المعالجة..." /> : <T en="Place Order" ar="إتمام الشراء" />}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: 15, color: 'var(--muted)' }}>
              <T en="By placing your order, you agree to our Terms and Conditions." ar="بإتمامك للطلب، أنت توافق على الشروط والأحكام الخاصة بنا." />
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
