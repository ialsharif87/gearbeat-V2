"use client";

import React, { useState, useEffect } from "react";
import T from "@/components/t";

interface Section {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: string;
}

interface StudioManagementLayoutProps {
  children: React.ReactNode;
  sections: Section[];
  completionPercentage: number;
  studioName: string;
}

export default function StudioManagementLayout({
  children,
  sections,
  completionPercentage,
  studioName,
}: StudioManagementLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gb-bg)', color: 'var(--gb-text)', paddingBottom: '100px' }}>
      {/* Top Header with Progress */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(11, 15, 22, 0.9)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid var(--gb-border)', 
        padding: '24px 0' 
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{studioName}</h1>
            <div className="gb-eyebrow" style={{ marginTop: '4px', marginBottom: 0 }}>
              <T en="Studio Management" ar="إدارة الاستوديو" />
            </div>
          </div>
          
          <div style={{ flex: 1, maxWidth: '400px' }} className="hidden-mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
              <span><T en="Profile Completion" ar="اكتمال الملف" /></span>
              <span style={{ color: 'var(--gb-gold)' }}>{completionPercentage}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '99px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--gb-gold), var(--gb-teal))', 
                  borderRadius: '99px', 
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: `${completionPercentage}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <nav style={{ 
        display: 'none', 
        position: 'sticky', 
        top: '90px', 
        zIndex: 90, 
        background: 'var(--gb-bg)', 
        borderBottom: '1px solid var(--gb-border)' 
      }} className="show-mobile">
        <div style={{ display: 'flex', overflowX: 'auto', padding: '12px 20px', gap: '12px' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              className="gb-button"
              style={{ 
                whiteSpace: 'nowrap',
                background: activeSection === s.id ? 'var(--gb-gold)' : 'rgba(255,255,255,0.03)',
                color: activeSection === s.id ? '#000' : 'var(--gb-text-muted)',
                border: `1px solid ${activeSection === s.id ? 'var(--gb-gold)' : 'var(--gb-border)'}`,
                padding: '8px 16px',
                borderRadius: '99px'
              }}
              onClick={() => scrollToSection(s.id)}
            >
              <span style={{ marginLeft: '8px' }}>{s.icon}</span>
              <T en={s.titleEn} ar={s.titleAr} />
            </button>
          ))}
        </div>
      </nav>

      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '60px' }} id="manage-grid-layout">
        {/* Desktop Sidebar */}
        <aside className="hidden-mobile">
          <div style={{ position: 'sticky', top: '140px' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  className="gb-button"
                  style={{ 
                    background: activeSection === s.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: activeSection === s.id ? 'var(--gb-gold)' : 'var(--gb-text-muted)',
                    justifyContent: 'flex-start',
                    padding: '16px 20px',
                    width: '100%',
                    position: 'relative'
                  }}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span style={{ fontSize: '1.2rem', marginLeft: '16px' }}>{s.icon}</span>
                  <T en={s.titleEn} ar={s.titleAr} />
                  {activeSection === s.id && (
                    <span style={{ 
                      position: 'absolute', 
                      left: '20px', 
                      width: '6px', 
                      height: '6px', 
                      background: 'var(--gb-gold)', 
                      borderRadius: '50%',
                      boxShadow: '0 0 10px var(--gb-gold)' 
                    }}></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          #manage-grid-layout { grid-template-columns: 1fr !important; gap: 20px !important; }
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}} />
    </div>
  );
}
