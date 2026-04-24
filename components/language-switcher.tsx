"use client";

import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("gearbeat_language");

    if (savedLanguage === "ar" || savedLanguage === "en") {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
    }
  }, []);

  function changeLanguage(nextLanguage: "en" | "ar") {
    setLanguage(nextLanguage);
    localStorage.setItem("gearbeat_language", nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";

    window.dispatchEvent(
      new CustomEvent("gearbeat-language-change", {
        detail: { language: nextLanguage }
      })
    );
  }

  return (
    <div className="language-switcher" aria-label="Language switcher">
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>

      <button
        type="button"
        className={language === "ar" ? "active" : ""}
        onClick={() => changeLanguage("ar")}
      >
        AR
      </button>
    </div>
  );
}
