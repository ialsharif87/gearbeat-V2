"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    const savedLang = document.cookie.split("; ").find(row => row.startsWith("gb_lang="))?.split("=")[1] || "ar";
    setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    
    // Update cookie
    document.cookie = `gb_lang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Update URL param
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <button 
      onClick={toggleLanguage}
      style={{ 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid #222', 
        color: '#fff', 
        textAlign: 'center', 
        padding: '10px 12px', 
        cursor: 'pointer', 
        fontSize: '0.85rem',
        borderRadius: 8,
        fontWeight: 700,
        width: '100%'
      }}
    >
      🌐 {lang === "ar" ? "English" : "العربية"}
    </button>
  );
}
