import Link from "next/link";
import T from "../components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createAdminClient();

  // Data Fetching
  const [{ data: promos }, { data: products }, { data: studios }] = await Promise.all([
    supabase.from("marketplace_promos").select("*").eq("is_active", true).order("priority", { ascending: false }),
    supabase.from("marketplace_products").select("*").eq("is_active", true).limit(4),
    supabase.from("studios").select("*").eq("status", "approved").limit(6),
  ]);

  return (
    <section className="premium-homepage" style={{ background: 'var(--gb-bg)', color: 'var(--gb-text-ivory)' }}>
      
      {/* 1. STICKY HEADER (Glass Morphism) */}
      <header className="glass-nav" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-section">
           {/* Logo exists in project - using a placeholder for height representation */}
           <div style={{ height: 40, width: 120, background: 'var(--gb-gold)', borderRadius: 8, opacity: 0.1 }}>LOGO</div>
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: '1rem', fontWeight: 700 }}>
          <Link href="/"><T en="Home" ar="الرئيسية" /></Link>
          <Link href="/studios"><T en="Studios" ar="الاستوديوهات" /></Link>
          <Link href="/gear/products"><T en="Equipment" ar="المعدات" /></Link>
          <Link href="/services"><T en="Services" ar="الخدمات" /></Link>
        </nav>
        <div className="header-actions" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <button style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem' }}>EN / عربي</button>
          <div style={{ position: 'relative' }}>
            🛒 <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--gb-gold)', color: '#000', fontSize: '0.6rem', padding: '2px 5px', borderRadius: 10, fontWeight: 900 }}>3</span>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <div className="hero-section" style={{ position: 'relative', padding: '120px 40px', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        {/* Animated Waveform Background */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'flex', gap: 8, opacity: 0.1, zHeight: -1 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100 + 50}px` }} />
          ))}
        </div>
        
        <div style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <h1 className="gold-gradient" style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1.1 }}>
            <T en="Start Your Sound" ar="ابدأ صوتك" />
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--gb-text-steel)', marginTop: 24, maxWidth: 600 }}>
            <T 
              en="World-class music ecosystem in Saudi Arabia. Rent gear, book studios, and collaborate with legends." 
              ar="أول منظومة موسيقية عالمية في السعودية. استأجر المعدات، احجز الاستوديوهات، وتعاون مع الأساطير." 
            />
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
            <Link href="/studios" className="btn-gold"><T en="Explore Studios" ar="استكشف الاستوديوهات" /></Link>
            <Link href="/gear/products" className="btn-teal-outline"><T en="Browse Equipment" ar="تصفح المعدات" /></Link>
          </div>
          
          {/* Floating Badges */}
          <div style={{ display: 'flex', gap: 30, marginTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--gb-gold)', fontWeight: 900 }}>+500</span> <T en="Studios" ar="استوديو" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--gb-teal)', fontWeight: 900 }}>+10K</span> <T en="Bookings" ar="حجز ناجح" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY BUBBLES */}
      <div style={{ padding: '40px', overflowX: 'auto', display: 'flex', gap: 20, scrollbarWidth: 'none' }}>
        {[
          { en: "Recording", ar: "تسجيل صوتي", icon: "🎙️" },
          { en: "Podcast", ar: "بودكاست", icon: "📱" },
          { en: "Mix & Master", ar: "مكس وماسترنج", icon: "🎚️" },
          { en: "Photography", ar: "تصوير", icon: "📸" },
          { en: "Music Production", ar: "إنتاج موسيقي", icon: "🎹" },
          { en: "Live Stream", ar: "بث مباشر", icon: "🎥" },
          { en: "Gear Rental", ar: "تأجير معدات", icon: "🎤" },
          { en: "Lessons", ar: "دروس خصوصية", icon: "🎸" }
        ].map((cat, i) => (
          <div key={i} style={{ 
            minWidth: 160, 
            padding: '24px', 
            borderRadius: 24, 
            background: 'linear-gradient(135deg, #1C2230 0%, #151A22 100%)', 
            textAlign: 'center', 
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }} className="category-bubble">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{cat.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}><T en={cat.en} ar={cat.ar} /></div>
          </div>
        ))}
      </div>

      {/* 4. BENTO GRID */}
      <div style={{ padding: '80px 40px' }}>
        <div className="bento-grid">
          <div className="premium-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800)', backgroundSize: 'cover' }}>
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #000, transparent)' }} />
             <div style={{ position: 'relative' }}>
               <span className="badge badge-gold" style={{ marginBottom: 10 }}>STUDIO OF THE MONTH</span>
               <h2 style={{ fontSize: '2.5rem' }}>The Red Room Riyadh</h2>
               <button className="btn-gold" style={{ marginTop: 20 }}>Book Now</button>
             </div>
          </div>
          <div className="premium-card" style={{ padding: 30 }}>
            <h3><T en="Services" ar="الخدمات" /></h3>
            <ul style={{ listStyle: 'none', marginTop: 20, color: 'var(--gb-text-steel)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li>✅ Mixing & Mastering</li>
              <li>✅ Vocal Tuning</li>
              <li>✅ Beat Licensing</li>
            </ul>
          </div>
          <div className="premium-card" style={{ padding: 30, background: 'var(--gb-teal-glow)' }}>
            <h3><T en="Gear Showcase" ar="استعراض المعدات" /></h3>
            <p style={{ marginTop: 10 }}>Explore the latest analog synths.</p>
          </div>
          <div className="premium-card" style={{ gridColumn: 'span 2', padding: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Featured Studio Preview</h3>
              <p style={{ color: 'var(--gb-text-steel)' }}>High-end acoustics in Jeddah.</p>
            </div>
            <button className="btn-gold">Preview</button>
          </div>
        </div>
      </div>

      {/* 5. FEATURED STUDIOS (Netflix Carousel) */}
      <div style={{ padding: '80px 40px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 40 }}><T en="Top Rated Studios" ar="أفضل الاستوديوهات" /></h2>
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 20 }}>
          {studios?.map((studio) => (
            <div key={studio.id} className="premium-card" style={{ minWidth: 350, height: 450 }}>
              <div style={{ height: '60%', backgroundImage: `url(${studio.cover_image_url})`, backgroundSize: 'cover' }} />
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{studio.name_en}</h3>
                  <div style={{ color: 'var(--gb-gold)' }}>★ 4.9</div>
                </div>
                <p style={{ color: 'var(--gb-text-steel)', fontSize: '0.9rem' }}>{studio.city} • {studio.district}</p>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{studio.hourly_rate} <span style={{ fontSize: '0.7rem' }}>SAR/HR</span></div>
                  <button className="btn-gold" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. LIVE ACTIVITY TICKER */}
      <div style={{ background: 'var(--gb-surface-light)', padding: '20px 0', overflow: 'hidden', borderY: '1px solid #333' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'tickerMove 30s linear infinite' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, marginHorizontal: 40, fontSize: '0.9rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--gb-gold)' }}>●</span> أحمد حجز استديو صوت في الرياض
              <span style={{ color: 'var(--gb-teal)' }}>●</span> سارة اشترت ميكروفون Shure SM7B
              <span style={{ color: 'var(--gb-gold)' }}>●</span> فهد قام بتوثيق استديو جديد
            </div>
          ))}
        </div>
      </div>

      {/* 7. FEATURED GEAR */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '2.5rem' }}><T en="New Arrivals" ar="وصل حديثاً" /></h2>
          <Link href="/gear/products" style={{ color: 'var(--gb-gold)' }}>View All Gear</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {products?.map((p) => (
            <div key={p.id} className="premium-card" style={{ padding: 20 }}>
               <div style={{ height: 200, background: 'rgba(255,255,255,0.02)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {p.images?.[0] ? <img src={p.images[0]} style={{ maxWidth: '80%', maxHeight: '80%' }} /> : '📦'}
               </div>
               <div style={{ marginTop: 20 }}>
                 <span style={{ fontSize: '0.7rem', color: 'var(--gb-teal)', fontWeight: 900 }}>NEW DROP</span>
                 <h3 style={{ fontSize: '1.1rem', margin: '4px 0' }}>{p.name_en}</h3>
                 <div style={{ display: 'flex', gap: 4, color: 'var(--gb-gold)', fontSize: '0.8rem' }}>★★★★★</div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                   <div style={{ fontWeight: 900 }}>{p.base_price} SAR</div>
                   <button style={{ background: 'var(--gb-teal)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem' }}>Add to Cart</button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. WHY GEARBEAT */}
      <div style={{ padding: '100px 40px', background: 'var(--gb-surface-light)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {[
            { t: "Verified Studios", ar: "استديوهات موثوقة", icon: "🏆" },
            { t: "Secure Payments", ar: "دفع آمن", icon: "🔒" },
            { t: "24/7 Support", ar: "دعم ٢٤/٧", icon: "💬" },
            { t: "Quality Guarantee", ar: "ضمان الجودة", icon: "⭐" }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>{item.icon}</div>
              <h3 style={{ marginBottom: 10 }}><T en={item.t} ar={item.ar} /></h3>
              <p style={{ color: 'var(--gb-text-steel)', fontSize: '0.9rem' }}>Elite standards for professional results.</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. ANIMATED STATS */}
      <div style={{ padding: '80px 40px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div className="gold-gradient" style={{ fontSize: '4rem', fontWeight: 900 }}>+500</div>
          <div style={{ color: 'var(--gb-text-steel)' }}>استديو معتمد</div>
        </div>
        <div>
          <div className="gold-gradient" style={{ fontSize: '4rem', fontWeight: 900 }}>+10K</div>
          <div style={{ color: 'var(--gb-text-steel)' }}>حجز مكتمل</div>
        </div>
        <div>
          <div className="gold-gradient" style={{ fontSize: '4rem', fontWeight: 900 }}>+2K</div>
          <div style={{ color: 'var(--gb-text-steel)' }}>منتج حصري</div>
        </div>
        <div>
          <div className="gold-gradient" style={{ fontSize: '4rem', fontWeight: 900 }}>4.9</div>
          <div style={{ color: 'var(--gb-text-steel)' }}>متوسط التقييم</div>
        </div>
      </div>

      {/* 10. JOIN US CTAs */}
      <div style={{ padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        <div className="premium-card" style={{ padding: 60, textAlign: 'center', background: 'linear-gradient(135deg, #D4AF37 0%, #B68D27 100%)', color: '#000' }}>
           <h2 style={{ fontSize: '2.5rem' }}><T en="Own a Studio?" ar="هل تملك استديو؟" /></h2>
           <p style={{ fontSize: '1.2rem', margin: '20px 0' }}><T en="Join as a partner and start earning." ar="انضم كشريك وابدأ بتحقيق الأرباح." /></p>
           <button className="btn-gold" style={{ background: '#000', color: '#fff' }}>Get Started</button>
        </div>
        <div className="premium-card" style={{ padding: 60, textAlign: 'center' }}>
           <h2 style={{ fontSize: '2.5rem' }}><T en="Sell Gear?" ar="هل تبيع معدات؟" /></h2>
           <p style={{ fontSize: '1.2rem', margin: '20px 0' }}><T en="Open your store today." ar="افتح متجرك الإلكتروني اليوم." /></p>
           <button className="btn-teal-outline">Learn More</button>
        </div>
      </div>

      {/* 11. FOOTER */}
      <footer style={{ padding: '80px 40px', background: '#05070A', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 60 }}>
          <div>
            <div style={{ height: 40, width: 120, background: 'var(--gb-gold)', borderRadius: 8, opacity: 0.1, marginBottom: 20 }}>LOGO</div>
            <p style={{ color: 'var(--gb-text-steel)', fontSize: '0.9rem' }}>The future of music production in the GCC. Built for creators, by creators.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: 20 }}>Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--gb-text-steel)' }}>
              <li>About Us</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: 20 }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--gb-text-steel)' }}>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: 20 }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: 20, fontSize: '1.5rem' }}>
              📸 🐦 🎵 📺
            </div>
          </div>
        </div>
        <div style={{ marginTop: 80, pt: 40, borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', color: 'var(--gb-text-steel)', fontSize: '0.8rem' }}>
          <div>© 2026 GearBeat - جميع الحقوق محفوظة</div>
          <div style={{ display: 'flex', gap: 15 }}>
            💳 🍎 🛡️
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'var(--gb-surface)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #333', zIndex: 1000 }}>
        <Link href="/" style={{ fontSize: '1.2rem' }}>🏠</Link>
        <Link href="/studios" style={{ fontSize: '1.2rem' }}>🎧</Link>
        <Link href="/gear" style={{ fontSize: '1.2rem' }}>📦</Link>
        <Link href="/account" style={{ fontSize: '1.2rem' }}>👤</Link>
        <Link href="/cart" style={{ fontSize: '1.2rem' }}>🛒</Link>
      </nav>

    </section>
  );
}
