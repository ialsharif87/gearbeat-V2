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
    <div className="min-h-screen bg-[#0B0F16] text-white pb-[100px]">
      {/* Top Header with Progress */}
      <header className="sticky top-0 z-[100] bg-[rgba(11,15,22,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.08)] py-6">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex justify-between items-center gap-10">
          <div className="studio-info">
            <h1 className="text-[1.4rem] lg:text-[1.8rem] font-[900] m-0 tracking-[-1px]">{studioName}</h1>
            <p className="mt-1 mb-0 text-[0.85rem] text-[#666] uppercase tracking-[1px] font-bold">
              <T en="Studio Management" ar="إدارة الاستوديو" />
            </p>
          </div>
          
          <div className="hidden lg:block flex-1 max-w-[400px]">
            <div className="flex justify-between text-[0.85rem] font-bold mb-2.5">
              <span><T en="Profile Completion" ar="اكتمال الملف" /></span>
              <span className="text-[#D4AF37]">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#0FA08A] rounded-full transition-[width] duration-[0.6s] ease-[cubic-bezier(0.4,0,0.2,1)]" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <nav className="lg:hidden sticky top-[90px] z-[90] bg-[#0B0F16] border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex overflow-x-auto p-[12px_20px] gap-3 no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[0.85rem] font-bold flex items-center gap-2 border transition-all ${
                activeSection === s.id 
                  ? "bg-[#D4AF37] text-[#0B0F16] border-[#D4AF37]" 
                  : "bg-white/5 border-[rgba(255,255,255,0.08)] text-[#888]"
              }`}
              onClick={() => scrollToSection(s.id)}
            >
              <span>{s.icon}</span>
              <span><T en={s.titleEn} ar={s.titleAr} /></span>
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto my-10 px-5 lg:px-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-[60px]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[140px]">
            <nav className="flex flex-col gap-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={`bg-transparent border-none p-[16px_20px] rounded-[16px] text-start text-[1rem] font-bold cursor-pointer transition-all duration-200 flex items-center gap-4 relative hover:bg-white/5 hover:text-white ${
                    activeSection === s.id ? "bg-[rgba(212,175,55,0.1)] text-[#D4AF37]" : "text-[#888]"
                  }`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="text-xl">{s.icon}</span>
                  <T en={s.titleEn} ar={s.titleAr} />
                  {activeSection === s.id && (
                    <span className="absolute right-5 rtl:right-auto rtl:left-5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-10">
          {children}
        </main>
      </div>
    </div>
  );
}
