"use client";

import { useEffect, useState } from "react";

type TProps = {
  en: string;
  ar: string;
};

function getSavedLanguage(): "en" | "ar" {
  if (typeof window === "undefined") return "en";

  const savedLanguage = window.localStorage.getItem("gearbeat_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
}

export default function T({ en, ar }: TProps) {
  const [language, setLanguage] = useState<"en" | "ar">(getSavedLanguage);

  useEffect(() => {
    const savedLanguage = getSavedLanguage();

    setLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<{ language: "en" | "ar" }>;

      if (
        customEvent.detail.language === "ar" ||
        customEvent.detail.language === "en"
      ) {
        setLanguage(customEvent.detail.language);
      }
    }

    window.addEventListener("gearbeat-language-change", handleLanguageChange);

    return () => {
      window.removeEventListener(
        "gearbeat-language-change",
        handleLanguageChange
      );
    };
  }, []);

  return <>{language === "ar" ? ar : en}</>;
}
