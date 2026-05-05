import Link from "next/link";
import T from "../components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createAdminClient();

  // Data Fetching
  const [{ data: products }, { data: studios }] = await Promise.all([
    supabase.from("marketplace_products").select("*").eq("is_active", true).limit(4),
    supabase.from("studios").select("*").eq("status", "approved").limit(6),
  ]);

  return (
    <section className="premium-homepage" style={{ background: '#020617', color: '#f2efe9', minHeight: '100vh' }}>
      
      {/* 1. STICKY HEADER (Glass Morphism) */}
      <header className="glass-nav" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        padding: '16px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="logo-section">
           <img src="/brand/logo-horizontal.svg" alt="GearBeat Logo" style={{ height: 45, width: 'auto' }} />
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: '1rem', fontWeight: 700 }}>
          <Link href="/studios" style={{ color: 'inherit', textDecoration: 'none' }}><T en="Studios" ar="الاستوديوهات" /></Link>
          <Link href="/services" style={{ color: 'inherit', textDecoration: 'none' }}><T en="Services" ar="الخدمات" /></Link>
          <Link href="/gear" style={{ color: 'inherit', textDecoration: 'none' }}><T en="Gear" ar="المعدات" /></Link>
        </nav>
        <div className="header-actions" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/login" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}><T en="Login" ar="دخول" /></Link>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            🛒 <span style={{ position: 'absolute', top: -8, right: -8, background: '#D4AF37', color: '#000', fontSize: '0.6rem', padding: '2px 5px', borderRadius: 10, fontWeight: 900 }}>0</span>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <div className="hero-section" style={{ position: 'relative', padding: '120px 40px', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)', zIndex: 0 }} />
        
        <div style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <h1 className="gold-gradient" style={{ 
            fontSize: 'clamp(3rem, 8vw, 6.5rem)', 
            fontWeight: 900, 
            lineHeight: 1.05,
            background: 'linear-gradient(135deg, #f0d67c 0%, #D4AF37 50%, #B68D27 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em'
          }}>
            <T en="Start Your Sound" ar="ابدأ صوتك" />
          </h1>
          <p style={{ fontSize: '1.4rem', color: '#94a3b8', marginTop: 32, maxWidth: 640, lineHeight: 1.6 }}>
            <T 
              en="World-class music ecosystem in Saudi Arabia. Rent gear, book studios, and collaborate with legends." 
              ar="أول منظومة موسيقية عالمية في السعودية. استأجر المعدات، احجز الاستوديوهات، وتعاون مع الأساطير." 
            />
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 48, flexWrap: 'wrap' }}>
            <Link href="/studios" style={{ 
              background: '#D4AF37', 
              color: '#000', 
              padding: '18px 40px', 
              borderRadius: 99, 
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
            }}><T en="Explore Studios" ar="استكشف الاستوديوهات" /></Link>
            <Link href="/gear" style={{ 
              border: '1px solid #20B2AA', 
              color: '#20B2AA', 
              padding: '18px 40px', 
              borderRadius: 99, 
              fontWeight: 800,
              textDecoration: 'none'
            }}><T en="Browse Gear" ar="تصفح المعدات" /></Link>
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
          { en: "Gear Rental", ar: "تأجير معدات", icon: "🎤" }
        ].map((cat, i) => (
          <div key={i} style={{ 
            minWidth: 160, 
            padding: '24px', 
            borderRadius: 24, 
            background: 'rgba(255,255,255,0.03)', 
            textAlign: 'center', 
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{cat.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}><T en={cat.en} ar={cat.ar} /></div>
          </div>
        ))}
      </div>

      {/* 4. BENTO GRID */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 28 
        }}>
          <div style={{ 
            gridColumn: 'span 2', 
            minHeight: 450,
            padding: 48, 
            borderRadius: 40,
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
             <div style={{ position: 'relative', zIndex: 1 }}>
               <span style={{ background: '#D4AF37', color: '#000', padding: '6px 16px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 900 }}>FEATURED SPOTLIGHT</span>
               <h2 style={{ fontSize: '3rem', margin: '20px 0', letterSpacing: '-0.02em' }}>The Red Room Riyadh</h2>
               <button style={{ background: '#D4AF37', border: 'none', padding: '14px 32px', borderRadius: 99, fontWeight: 900, cursor: 'pointer' }}>Book Experience</button>
             </div>
          </div>
          <div style={{ padding: 40, borderRadius: 40, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ fontSize: '1.8rem', color: '#D4AF37' }}><T en="Why GearBeat?" ar="لماذا جير بيت؟" /></h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              <T 
                en="The only platform designed for the Saudi music scene. Verified providers, local support, and world-class standards." 
                ar="المنصة الوحيدة المصممة للمشهد الموسيقي السعودي. مزودون موثوقون، دعم محلي، ومعايير عالمية." 
              />
            </p>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#20B2AA' }}>✔</span> <span>Verified Studios</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#20B2AA' }}>✔</span> <span>Secure Local Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LIVE ACTIVITY TICKER */}
      <div style={{ 
        background: '#0f172a', 
        padding: '20px 0', 
        overflow: 'hidden', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[1,2,3].map((_, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 40, marginInline: 40, fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>
              <span style={{ color: '#D4AF37' }}>●</span> <T en="Ahmed booked a studio in Riyadh" ar="أحمد حجز استديو في الرياض" />
              <span style={{ color: '#20B2AA' }}>●</span> <T en="Sarah purchased a Shure SM7B" ar="سارة اشترت ميكروفون Shure SM7B" />
              <span style={{ color: '#D4AF37' }}>●</span> <T en="Fahad verified a new studio" ar="فهد قام بتوثيق استديو جديد" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. FEATURED STUDIOS */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', margin: 0 }}><T en="Top Rated Studios" ar="أفضل الاستوديوهات" /></h2>
            <p style={{ color: '#64748b', marginTop: 12 }}>Handpicked spaces for high-end production.</p>
          </div>
          <Link href="/studios" style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
        </div>
        <div style={{ display: 'flex', gap: 28, overflowX: 'auto', paddingBottom: 32, scrollbarWidth: 'none' }}>
          {studios?.map((studio) => (
            <div key={studio.id} style={{ 
              minWidth: 380, 
              background: '#0f172a', 
              borderRadius: 32, 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.04)',
              transition: 'transform 0.3s'
            }}>
              <div style={{ 
                height: 220, 
                backgroundImage: `url(${studio.cover_image_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{studio.name_en || studio.name_ar}</h3>
                  <div style={{ color: '#D4AF37', fontWeight: 800 }}>★ 4.9</div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 8 }}>{studio.city_name || studio.city}</p>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{studio.hourly_rate} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>SAR/hr</span></div>
                  <button style={{ background: '#D4AF37', border: 'none', padding: '10px 24px', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '100px 40px 140px', background: '#010409', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 80 }}>
          <div style={{ maxWidth: 400 }}>
            <img src="/brand/logo-horizontal.svg" alt="GearBeat Logo" style={{ height: 45, width: 'auto', marginBottom: 28 }} />
            <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Empowering audio creators in the Middle East with the ultimate tools and spaces.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 24 }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', display: 'grid', gap: 14, fontSize: '0.9rem' }}>
                <li><Link href="/studios" style={{ color: 'inherit', textDecoration: 'none' }}>Studios</Link></li>
                <li><Link href="/gear" style={{ color: 'inherit', textDecoration: 'none' }}>Marketplace</Link></li>
                <li><Link href="/services" style={{ color: 'inherit', textDecoration: 'none' }}>Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 24 }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', display: 'grid', gap: 14, fontSize: '0.9rem' }}>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Studio Guidelines</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 100, textAlign: 'center', color: '#334155', fontSize: '0.85rem' }}>
          © 2026 GearBeat. Proudly built in Saudi Arabia.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 30, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'max-content',
        background: 'rgba(15, 23, 42, 0.85)', 
        backdropFilter: 'blur(16px)',
        display: 'flex', 
        gap: 16,
        padding: '12px 24px', 
        borderRadius: 30, 
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        zIndex: 1000 
      }}>
        <Link href="/" style={{ fontSize: '1.6rem', padding: 8 }}>🏠</Link>
        <Link href="/studios" style={{ fontSize: '1.6rem', padding: 8 }}>🎧</Link>
        <Link href="/gear" style={{ fontSize: '1.6rem', padding: 8 }}>📦</Link>
        <Link href="/login" style={{ fontSize: '1.6rem', padding: 8 }}>👤</Link>
      </nav>

    </section>
  );
}
