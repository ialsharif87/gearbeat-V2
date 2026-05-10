import Link from "next/link";
import T from "@/components/t";
import CustomerMembershipCard from "@/components/customer-membership-card";

export default function CustomerRewardsPage() {
  // SAMPLE DATA - NO LIVE DATABASE CALLS ALLOWED IN PHASE 53 FOUNDATION
  const sampleWallet = {
    tier_code: "creator",
    points_balance: 1250,
    pending_points: 250,
    wallet_balance: 75.00,
    currency_code: "SAR",
    membership_number: "GB-SAMPLE-001",
    referral_code: "GB-REF-123",
  };

  const sampleProfile = {
    full_name: "GearBeat Artist",
    membership_number: "GB-SAMPLE-001",
  };

  const currentTierName = "Creator";
  const nextTierName = "Producer";
  const progressPercent = 65;

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div className="flex-between">
          <div>
            <p className="gb-eyebrow">
              <T en="GearBeat Rewards" ar="مكافآت GearBeat" />
            </p>
            <h1 style={{ marginTop: 10 }}>
              <T en="Membership & Rewards" ar="العضوية والمكافآت" />
            </h1>
            <p className="gb-muted-text" style={{ maxWidth: 760 }}>
              <T
                en="Track your membership level, points, wallet balance, and rewards. (Note: This is a UI Foundation. Live data sync coming soon.)"
                ar="تابع مستوى عضويتك، نقاطك، رصيد المحفظة، والمكافآت. (ملاحظة: هذه واجهة تأسيسية. سيتم تفعيل ربط البيانات قريباً.)"
              />
            </p>
          </div>
          <div className="foundation-badge">
             <T en="SAMPLE DATA — UI FOUNDATION" ar="بيانات عينة — واجهة تأسيسية" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
          <Link href="/offers" className="btn btn-primary">
            <T en="View offers" ar="عرض العروض" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <section style={{ marginTop: 28 }}>
          <CustomerMembershipCard
            fullName={sampleProfile.full_name}
            membershipNumber={sampleWallet.membership_number}
            tierCode={sampleWallet.tier_code}
            pointsBalance={sampleWallet.points_balance}
            pendingPoints={sampleWallet.pending_points}
            walletBalance={sampleWallet.wallet_balance}
            currencyCode={sampleWallet.currency_code}
            referralCode={sampleWallet.referral_code}
          />
        </section>

        <section className="gb-customer-grid" style={{ marginTop: 28 }}>
          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>⭐</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Available Points" ar="النقاط المتاحة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                1,250
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>⏳</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Pending Points" ar="النقاط المعلقة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                250
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🏦</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Wallet Balance" ar="رصيد المحفظة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                75.00 SAR
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🎖️</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Current Level" ar="المستوى الحالي" />
              </label>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                {currentTierName}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 360px",
            gap: 22,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 22 }}>
            <div className="card">
              <h2>
                <T en="Progress to next level" ar="التقدم للمستوى التالي" />
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                <T
                  en={`You are currently ${currentTierName}. Reach ${nextTierName} to unlock premium rewards.`}
                  ar={`أنت الآن في مستوى ${currentTierName}. صل إلى ${nextTierName} لفتح مكافآت مميزة.`}
                />
              </p>
              <div
                style={{
                  marginTop: 18,
                  height: 14,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, rgba(207,167,98,0.9), rgba(255,255,255,0.65))",
                  }}
                />
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                <span>{progressPercent}%</span>
                <span><T en="Target: 5,000 points" ar="الهدف: 5,000 نقطة" /></span>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid rgba(207, 168, 110, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>
                  <T en="Welcome Kit Progress" ar="تقدم حقيبة الترحيب" />
                </h2>
                <span className="badge-beta" style={{ fontSize: '0.6rem', opacity: 0.5 }}>COMING SOON</span>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                  <T en="First Booking Welcome Kit" ar="حقيبة ترحيب الحجز الأول" />
                  <span style={{ color: 'var(--gb-gold)' }}>75%</span>
                </div>
                <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'var(--gb-gold)' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 12 }}>
                  <T 
                    en="Complete your first studio booking to unlock your GearBeat Welcome Kit. (No live rewards automation yet)" 
                    ar="أكمل أول حجز استوديو لك لفتح حقيبة ترحيب GearBeat. (لا يوجد أتمتة حية للمكافآت بعد)" 
                  />
                </p>
                <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #1a1a1a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}><T en="Fulfillment Status" ar="حالة التنفيذ" /></span>
                    <span className="pill" style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', padding: '2px 8px', borderRadius: 4 }}>PENDING — SAMPLE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2><T en="Recent Activity Preview" ar="معاينة النشاط الأخير" /></h2>
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {[
                  { desc: "First Account Verification", date: "2026-05-01", points: "+500", status: "Sample" },
                  { desc: "Referral Invite Sent", date: "2026-05-05", points: "+250", status: "Sample" },
                ].map((act, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{act.desc}</strong>
                      <p style={{ color: "var(--muted)", marginTop: 4 }}>{act.date} · {act.status}</p>
                    </div>
                    <strong style={{ color: "#00ff88" }}>{act.points}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside style={{ display: "grid", gap: 22 }}>
            <div className="card">
              <h2><T en="Referral code" ar="كود الإحالة" /></h2>
              <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(207,167,98,0.1)", border: "1px solid rgba(207,167,98,0.22)" }}>
                <strong style={{ display: "block", letterSpacing: 1.4, fontSize: "1.3rem" }}>GB-SAMPLE-REF</strong>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 12 }}>
                <T en="Referral rewards will be activated in a later phase." ar="سيتم تفعيل مكافآت الإحالة في مرحلة لاحقة." />
              </p>
            </div>

            <div className="card" style={{ border: "1px dashed rgba(207,167,98,0.4)", background: "rgba(207,167,98,0.02)" }}>
              <h2><T en="Future Loyalty Engine" ar="محرك الولاء المستقبلي" /></h2>
              <span className="badge badge-warning" style={{ marginTop: 8, display: 'inline-block', fontSize: '0.65rem' }}>
                <T en="PLANNING PHASE" ar="مرحلة التخطيط" />
              </span>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 16, lineHeight: 1.6 }}>
                <T 
                  en="The unified GearBeat Loyalty Engine will soon allow you to earn and redeem points across the entire ecosystem:" 
                  ar="سيتيح لك محرك ولاء جيربيت الموحد قريباً اكتساب واستبدال النقاط عبر النظام البيئي بأكمله:" 
                />
              </p>
              <ul style={{ paddingInlineStart: 20, color: "var(--muted)", fontSize: "0.85rem", marginTop: 12, lineHeight: 1.6 }}>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Studios:" ar="الاستوديوهات:" /></strong> <T en="Earn on completed bookings." ar="اكتسب من الحجوزات المكتملة." /></li>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Marketplace:" ar="السوق:" /></strong> <T en="Earn on verified gear purchases." ar="اكتسب من مشتريات المعدات الموثقة." /></li>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Ticketing:" ar="التذاكر:" /></strong> <T en="Earn on event check-ins." ar="اكتسب من تسجيل الدخول للفعاليات." /></li>
              </ul>
            </div>

            <div className="card" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(135deg, rgba(207,167,98,0.05), transparent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: "1.5rem" }}>📱</span>
                <h3 style={{ fontSize: "1.1rem" }}><T en="Mobile App Readiness" ar="جاهزية تطبيق الجوال" /></h3>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                <T 
                  en="GearBeat is preparing native iOS and Android wallet integration. Soon, you'll be able to tap to redeem points and scan QR codes for event entry directly from your phone." 
                  ar="تقوم جيربيت بإعداد دمج محافظ iOS و Android الأصلية. قريباً، ستتمكن من النقر لاستبدال النقاط ومسح رموز QR لدخول الفعاليات مباشرة من هاتفك." 
                />
              </p>
            </div>
          </aside>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gb-customer-page { padding: 40px; color: #fff; }
        .gb-customer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .gb-customer-card { padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; display: flex; align-items: center; gap: 20px; }
        .foundation-badge { background: rgba(207, 168, 110, 0.1); border: 1px solid var(--gb-gold); color: var(--gb-gold); padding: 6px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: 900; }
        .badge-beta { font-weight: 900; letter-spacing: 1px; color: var(--gb-gold); }
      `}} />
    </main>
  );
}
