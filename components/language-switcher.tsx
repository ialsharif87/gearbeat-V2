"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function getTargetHref(pathname: string, currentParams: URLSearchParams, lang: "ar" | "en") {
  const params = new URLSearchParams(currentParams.toString());
  params.set("lang", lang);

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLang = searchParams.get("lang") === "en" ? "en" : "ar";

  return (
    <div className="language-switcher">
      <Link
        href={getTargetHref(pathname, searchParams, "en")}
        className={currentLang === "en" ? "active" : ""}
      >
        EN
      </Link>

      <Link
        href={getTargetHref(pathname, searchParams, "ar")}
        className={currentLang === "ar" ? "active" : ""}
      >
        AR
      </Link>
    </div>
  );
}
