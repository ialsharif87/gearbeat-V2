"use client";

import React from "react";
import T from "./t";

type SmartDiscoveryPreviewProps = {
  vertical: "marketplace" | "studios" | "services" | "tickets" | "academy";
};

export default function SmartDiscoveryPreview({ vertical }: SmartDiscoveryPreviewProps) {
  const intents = {
    marketplace: [
      { en: "Beginner gear", ar: "معدات للمبتدئين" },
      { en: "Pro audio", ar: "أجهزة احترافية" },
      { en: "Home studio", ar: "استوديو منزلي" },
      { en: "Accessories", ar: "إكسسوارات" },
    ],
    studios: [
      { en: "Recording", ar: "تسجيل" },
      { en: "Mixing", ar: "ميكساج" },
      { en: "Podcast", ar: "بودكاست" },
      { en: "Rehearsal", ar: "بروفة" },
    ],
    services: [
      { en: "Mixing", ar: "ميكسينج" },
      { en: "Mastering", ar: "ماسترينج" },
      { en: "Production", ar: "إنتاج" },
      { en: "Voice-over", ar: "تعليق صوتي" },
    ],
    tickets: [
      { en: "Live events", ar: "فعاليات مباشرة" },
      { en: "Workshops", ar: "ورش عمل" },
      { en: "Studio sessions", ar: "جلسات استوديو" },
      { en: "Community", ar: "مجتمع" },
    ],
    academy: [
      { en: "1-on-1 lessons", ar: "دروس خصوصية" },
      { en: "Group classes", ar: "صفوف جماعية" },
      { en: "Voice", ar: "صوت" },
      { en: "Production", ar: "إنتاج" },
    ],
  };

  const chips = intents[vertical] || [];

  return (
    <div className="smart-discovery-wrapper mb-40 animate-up" style={{ width: '100%' }}>
      <div className="card-premium p-24" style={{ 
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient glow */}
        <div style={{ 
          position: 'absolute', 
          top: '-20%', 
          right: '-5%', 
          width: '150px', 
          height: '150px', 
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              background: 'var(--gb-gold)', 
              borderRadius: '50%', 
              boxShadow: '0 0 10px var(--gb-gold)' 
            }}></div>
            <h4 style={{ margin: 0, color: 'var(--gb-gold)', fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 900 }}>
              <T en="Ask GearBeat AI Discovery" ar="اكتشاف GearBeat بالذكاء الاصطناعي" />
            </h4>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '30px', fontWeight: 700 }}>
            <T en="UI Preview" ar="معاينة الواجهة" />
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          cursor: 'text',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}>
          <div style={{ flex: 1, paddingLeft: 14, color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic', fontSize: '0.9rem' }}>
             <T en="Describe what you need..." ar="صف لنا ما تحتاجه..." />
          </div>
          <div style={{ 
            background: 'var(--gb-gold)',
            width: 36,
            height: 36,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontSize: '1rem',
            opacity: 0.9,
            fontWeight: 'bold'
          }}>
            ✨
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {chips.map((chip, i) => (
            <div key={i} className="hover-lift" style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ color: 'var(--gb-gold)', opacity: 0.5 }}>#</span>
              <T en={chip.en} ar={chip.ar} />
            </div>
          ))}
        </div>

        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          paddingTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--gb-gold)' }}>💡</span>
              <T en="Tip: Use specific intents like 'podcast setup' or 'vocal recording'." ar="نصيحة: استخدم احتياجات محددة مثل 'تجهيز بودكاست' أو 'تسجيل غناء'." />
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6, fontSize: '0.62rem' }}>
              <span>⚠️</span>
              <T en="AI advice is advisory only — confirm hardware compatibility with your engineer." ar="مشورة الذكاء الاصطناعي استشارية فقط — تحقق من توافق الأجهزة مع مهندسك المختص." />
            </span>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
             <span style={{ fontSize: '0.6rem', color: 'var(--gb-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 }}>
               <T en="Precise Discovery" ar="اكتشاف دقيق" />
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
