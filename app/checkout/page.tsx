"use client";

import { useCart } from "../../context/cart-context";
import T from "../../components/t";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ManualCheckoutConfirmButton from "@/components/manual-checkout-confirm-button";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, syncWithDB, isLoading } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
         <h2 style={{ marginBottom: 20 }}><T en="Your cart is empty" ar="سلتك فارغة" /></h2>
         <Link href="/gear" className="btn btn-primary"><T en="Go back to shopping" ar="العودة للتسوق" /></Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);
    setOrderResult(null);

    try {
      // 1. Sync local cart to DB
      await syncWithDB();

      // 2. Create real order
      const response = await fetch("/api/marketplace/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setOrderResult(data);
      clearCart();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="section-padding" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid var(--gb-gold-light)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 30px' }}>
            ✓
          </div>
          <span className="badge badge-gold"><T en="Order Created" ar="تم إنشاء الطلب" /></span>
          <h1 style={{ marginTop: 20 }}><T en="Order # " ar="طلب رقم # " />{orderResult.orderNumber}</h1>
          <p style={{ color: 'var(--muted)', marginTop: 15, fontSize: '1.1rem' }}>
            <T en="Your order has been initialized. Please complete the payment to finalize." ar="تم بدء طلبك. يرجى إكمال عملية الدفع للإنهاء." />
          </p>

          <div style={{ marginTop: 40, padding: 30, background: 'rgba(255,255,255,0.03)', borderRadius: 20 }}>
             <h3 style={{ marginBottom: 20 }}><T en="Secure Payment" ar="الدفع الآمن" /></h3>
             <p style={{ marginBottom: 30, fontSize: '0.9rem' }}>
               <T en="Amount to pay:" ar="المبلغ المطلوب:" /> <strong style={{ color: 'var(--gb-gold)', fontSize: '1.2rem' }}>{orderResult.amount} {orderResult.currencyCode}</strong>
             </p>
             
             <ManualCheckoutConfirmButton checkoutSessionId={orderResult.checkoutSessionId} />
          </div>

          <div style={{ marginTop: 30 }}>
            <Link href="/customer/marketplace-orders" style={{ color: 'var(--muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>
              <T en="View my orders" ar="مشاهدة طلباتي" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          <T en="Checkout" ar="إتمام الطلب" />
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          <T en="Review your items and provide shipping details." ar="راجع مشترياتك وأدخل تفاصيل الشحن." />
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 30 }}>
          {/* Shipping Card */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ marginBottom: 25, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gb-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
              <T en="Shipping Information" ar="معلومات الشحن" />
            </h3>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="First Name" ar="الاسم الأول" /></label>
                  <input className="input" required placeholder="Ahmed" style={{ background: 'rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="Last Name" ar="الاسم الأخير" /></label>
                  <input className="input" required placeholder="Al-Sharif" style={{ background: 'rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="Street Address" ar="عنوان الشارع" /></label>
                <input className="input" required placeholder="King Fahd Road, Al Olaya" style={{ background: 'rgba(0,0,0,0.2)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="City" ar="المدينة" /></label>
                  <input className="input" required placeholder="Riyadh" style={{ background: 'rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="Region" ar="المنطقة" /></label>
                  <input className="input" required placeholder="Riyadh Region" style={{ background: 'rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="Postal Code" ar="الرمز البريدي" /></label>
                  <input className="input" required placeholder="12211" style={{ background: 'rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8, display: 'block' }}><T en="Phone Number" ar="رقم الجوال" /></label>
                <input className="input" required placeholder="+966 5XXXXXXXX" style={{ background: 'rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.7 }}>
             <h3 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
              <T en="Payment Method" ar="طريقة الدفع" />
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              <T en="Payment options will be available after creating the order." ar="خيارات الدفع ستكون متاحة بعد إنشاء الطلب." />
            </p>
          </div>
        </div>

        <div className="sticky-card">
          <div className="card" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{ marginBottom: 20 }}><T en="Order Summary" ar="ملخص الطلب" /></h3>
            
            <div style={{ display: 'grid', gap: 15, maxHeight: 300, overflowY: 'auto', paddingRight: 10 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 8, background: 'rgba(0,0,0,0.3)', flexShrink: 0, overflow: 'hidden' }}>
                    {item.image && <img src={item.image} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name_en}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.quantity} x {item.price} SAR</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{item.price * item.quantity} SAR</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 25, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <T en="Subtotal" ar="المجموع" />
                <span>{totalPrice} SAR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <T en="Shipping" ar="الشحن" />
                <span style={{ color: '#00ff88' }}><T en="FREE" ar="مجاني" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900, marginTop: 10, color: 'var(--gb-gold)' }}>
                <T en="Total" ar="الإجمالي" />
                <span>{totalPrice} SAR</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large w-full" 
              style={{ marginTop: 30, height: 55, fontSize: '1.1rem' }} 
              disabled={loading}
            >
              {loading ? <T en="Processing..." ar="جاري المعالجة..." /> : <T en="Confirm & Place Order" ar="تأكيد وإتمام الطلب" />}
            </button>

            <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.8rem' }}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               <T en="Pilot Payment System · Manual Review" ar="نظام دفع تجريبي · مراجعة يدوية" />
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid #FFF;
          border-bottom-color: var(--gb-gold);
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .sticky-card {
          position: sticky;
          top: 100px;
        }
      `}</style>
    </div>
  );
}
