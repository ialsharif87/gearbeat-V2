"use client";

import { useEffect, useState } from "react";

type TProps = {
  en: string;
  ar: string;
};

export default function T({ en, ar }: TProps) {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("gearbeat_language");

    if (savedLanguage === "ar" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<{ language: "en" | "ar" }>;
      setLanguage(customEvent.detail.language);
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
