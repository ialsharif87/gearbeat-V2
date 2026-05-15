"use client";

import React from "react";
import T from "./t";

export default function AskGearBeatPreview() {
  const examplePrompts = [
    { en: "I need a podcast studio in Riyadh for 2 hours", ar: "أحتاج استوديو بودكاست في الرياض لمدة ساعتين" },
    { en: "Find me a beginner piano teacher online", ar: "ابحث لي عن معلم بيانو للمبتدئين أونلاين" },
    { en: "Recommend gear for a home podcast setup", ar: "اقترح لي معدات لتجهيز بودكاست منزلي" },
    { en: "I need mixing/mastering for a new track", ar: "أحتاج ميكسينج وماسترينج لتراك جديد" },
  ];

  const intentChips = ["City", "Budget", "Duration", "Category", "Skill Level", "Use Case"];

  return (
    <section className="ask-gearbeat-wrapper" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="card-premium animate-up" style={{ 
          padding: 'clamp(24px, 5vw, 48px)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: 'var(--gb-radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient background glow */}
          <div style={{ 
            position: 'absolute', 
            top: '-50%', 
            right: '-10%', 
            width: '300px', 
            height: '300px', 
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, gap: 20, position: 'relative', zIndex: 2 }}>
            <div>
              <h2 className="text-gold" style={{ margin: '0 0 8px', fontSize: '2.2rem', fontWeight: 900 }}>
                <T en="Ask GearBeat" ar="اسأل GearBeat" />
              </h2>
              <p className="text-muted" style={{ margin: 0, fontSize: '1.1rem' }}>
                <T en="Tell us what you need in plain language" ar="أخبرنا بما تحتاجه بلغة بسيطة" />
              </p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '8px 16px',
              borderRadius: '30px',
              fontSize: '0.75rem',
              color: 'var(--gb-gold)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
            }}>
              ✨ AI Discovery
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 40,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ flex: 1, paddingLeft: 20, color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
              <T en="I'm looking for..." ar="أبحث عن..." />
            </div>
            <div style={{ 
              background: 'var(--gb-gold)',
              color: '#000',
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '0.95rem',
              cursor: 'not-allowed',
              opacity: 0.9,
              boxShadow: '0 4px 10px rgba(212, 175, 55, 0.2)'
            }}>
              <T en="Search" ar="بحث" />
            </div>
          </div>

          <div style={{ marginBottom: 40, position: 'relative', zIndex: 2 }}>
            <p style={{ 
              fontSize: '0.75rem', 
              color: 'var(--gb-gold)', 
              textTransform: 'uppercase', 
              fontWeight: 800, 
              marginBottom: 20, 
              letterSpacing: 2,
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ width: 20, height: 1, background: 'var(--gb-gold)', opacity: 0.5 }}></span>
              <T en="Example Intents" ar="أمثلة للاحتياجات" />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              {examplePrompts.map((p, i) => (
                <div key={i} className="hover-lift" style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: 'var(--gb-gold)', 
                    boxShadow: '0 0 8px var(--gb-gold)' 
                  }}></div>
                  <T en={p.en} ar={p.ar} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40, position: 'relative', zIndex: 2 }}>
             <p style={{ 
              fontSize: '0.75rem', 
              color: 'var(--gb-gold)', 
              textTransform: 'uppercase', 
              fontWeight: 800, 
              marginBottom: 20, 
              letterSpacing: 2,
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ width: 20, height: 1, background: 'var(--gb-gold)', opacity: 0.5 }}></span>
              <T en="Intent Extraction Preview" ar="معاينة استخراج النية" />
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {intentChips.map((chip) => (
                <span key={chip} style={{ 
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--gb-gold)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px 24px', 
              background: 'rgba(212, 175, 55, 0.03)', 
              border: '1px solid rgba(212, 175, 55, 0.15)', 
              borderRadius: '12px' 
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚖️</span>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0, fontWeight: 500 }}>
                <T 
                  en="AI Discovery Preview — Results are simulated for demonstration. Full intelligence engine launching soon." 
                  ar="معاينة اكتشاف الذكاء الاصطناعي - النتائج محاكاة للعرض فقط. محرك الذكاء الكامل سينطلق قريباً." 
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
