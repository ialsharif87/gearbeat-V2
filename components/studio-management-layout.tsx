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
    <div className="manage-layout-root">
      {/* Top Header with Progress */}
      <header className="manage-header">
        <div className="header-content">
          <div className="studio-info">
            <h1>{studioName}</h1>
            <p><T en="Studio Management" ar="إدارة الاستوديو" /></p>
          </div>
          
          <div className="progress-container">
            <div className="progress-label">
              <span><T en="Profile Completion" ar="اكتمال الملف" /></span>
              <span className="percent">{completionPercentage}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <nav className="mobile-tabs">
        <div className="tabs-scroll">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`tab-btn ${activeSection === s.id ? "active" : ""}`}
              onClick={() => scrollToSection(s.id)}
            >
              <span className="icon">{s.icon}</span>
              <span className="txt"><T en={s.titleEn} ar={s.titleAr} /></span>
            </button>
          ))}
        </div>
      </nav>

      <div className="manage-grid">
        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar">
          <div className="sidebar-sticky">
            <nav className="nav-list">
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="icon">{s.icon}</span>
                  <T en={s.titleEn} ar={s.titleAr} />
                  {activeSection === s.id && <span className="active-dot"></span>}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="manage-main">
          {children}
        </main>
      </div>

      <style jsx global>{`
        :root {
          --gb-navy: #0B0F16;
          --gb-gold: #D4AF37;
          --gb-teal: #0FA08A;
          --gb-card-bg: rgba(255, 255, 255, 0.03);
          --gb-border: rgba(255, 255, 255, 0.08);
        }

        .manage-layout-root {
          min-height: 100vh;
          background: var(--gb-navy);
          color: white;
          padding: 0 0 100px 0;
        }

        .manage-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(11, 15, 22, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--gb-border);
          padding: 24px 0;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
        }

        .studio-info h1 {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -1px;
        }

        .studio-info p {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .progress-container {
          flex: 1;
          max-width: 400px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .progress-label .percent {
          color: var(--gb-gold);
        }

        .progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gb-gold), var(--gb-teal));
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .manage-grid {
          max-width: 1400px;
          margin: 40px auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 60px;
        }

        .sidebar-sticky {
          position: sticky;
          top: 140px;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          background: transparent;
          border: none;
          color: #888;
          padding: 16px 20px;
          border-radius: 16px;
          text-align: start;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .nav-item.active {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gb-gold);
        }

        .active-dot {
          position: absolute;
          right: 20px;
          width: 6px;
          height: 6px;
          background: var(--gb-gold);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--gb-gold);
        }

        .manage-main {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .mobile-tabs {
          display: none;
          position: sticky;
          top: 110px;
          z-index: 90;
          background: var(--gb-navy);
          border-bottom: 1px solid var(--gb-border);
        }

        .tabs-scroll {
          display: flex;
          overflow-x: auto;
          padding: 12px 20px;
          gap: 12px;
          scrollbar-width: none;
        }

        .tabs-scroll::-webkit-scrollbar { display: none; }

        .tab-btn {
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--gb-border);
          color: #888;
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tab-btn.active {
          background: var(--gb-gold);
          color: var(--gb-navy);
          border-color: var(--gb-gold);
        }

        @media (max-width: 1024px) {
          .manage-grid {
            grid-template-columns: 1fr;
            padding: 0 20px;
            margin-top: 20px;
          }
          .desktop-sidebar { display: none; }
          .mobile-tabs { display: block; }
          .header-content { padding: 0 20px; }
          .studio-info h1 { font-size: 1.4rem; }
          .progress-container { display: none; }
        }

        /* RTL Adjustments */
        [dir="rtl"] .nav-item { text-align: right; }
        [dir="rtl"] .active-dot { right: auto; left: 20px; }
      `}</style>
    </div>
  );
}
