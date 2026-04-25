"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TProps = {
  en: string;
  ar: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function normalizeLang(value: string | null | undefined) {
  return value === "en" ? "en" : "ar";
}

export default function T({ en, ar }: TProps) {
  const searchParams = useSearchParams();
  const queryLang = searchParams.get("lang");

  const initialLang = useMemo(() => {
    return normalizeLang(queryLang || getCookie("gb_lang") || "ar");
  }, [queryLang]);

  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const nextLang = normalizeLang(queryLang || getCookie("gb_lang") || "ar");

    setLang(nextLang);
    setCookie("gb_lang", nextLang);

    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  }, [queryLang]);

  return <>{lang === "en" ? en : ar}</>;
}
