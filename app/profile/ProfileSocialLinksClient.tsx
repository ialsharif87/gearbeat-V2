"use client";

import { useEffect, useMemo, useState } from "react";
import T from "../../components/t";

type Platform =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "linkedin"
  | "facebook"
  | "website";

type SocialLinkRow = {
  platform: Platform;
  url: string;
};

type SocialLinksResponse = {
  links?: SocialLinkRow[];
  error?: string;
};

type SaveState = "idle" | "loading" | "saving" | "success" | "error";

const SOCIAL_LINK_PLATFORMS: Array<{
  platform: Platform;
  en: string;
  ar: string;
  placeholder: string;
}> = [
  { platform: "instagram", en: "Instagram", ar: "إنستغرام", placeholder: "https://instagram.com/yourname" },
  { platform: "tiktok", en: "TikTok", ar: "تيك توك", placeholder: "https://tiktok.com/@yourname" },
  { platform: "x", en: "X / Twitter", ar: "إكس / تويتر", placeholder: "https://x.com/yourname" },
  { platform: "youtube", en: "YouTube", ar: "يوتيوب", placeholder: "https://youtube.com/@yourchannel" },
  { platform: "linkedin", en: "LinkedIn", ar: "لينكدإن", placeholder: "https://linkedin.com/in/yourname" },
  { platform: "facebook", en: "Facebook", ar: "فيسبوك", placeholder: "https://facebook.com/yourname" },
  { platform: "website", en: "Website", ar: "الموقع الإلكتروني", placeholder: "https://example.com" },
];

const EMPTY_LINKS = SOCIAL_LINK_PLATFORMS.reduce(
  (links, item) => ({ ...links, [item.platform]: "" }),
  {} as Record<Platform, string>
);

function isValidHttpUrl(value: string) {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildPayload(values: Record<Platform, string>) {
  return SOCIAL_LINK_PLATFORMS.map(({ platform }) => ({
    platform,
    url: values[platform].trim(),
    handle: null,
  })).filter((link) => link.url);
}

export default function ProfileSocialLinksClient() {
  const [values, setValues] = useState<Record<Platform, string>>(EMPTY_LINKS);
  const [state, setState] = useState<SaveState>("loading");
  const [error, setError] = useState("");

  const hasAnyValue = useMemo(
    () => Object.values(values).some((value) => value.trim()),
    [values]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSocialLinks() {
      setState("loading");
      setError("");

      try {
        const response = await fetch("/api/customer/social-links", {
          headers: { Accept: "application/json" },
        });
        const data = (await response.json().catch(() => ({}))) as SocialLinksResponse;

        if (!response.ok) {
          throw new Error(data.error || "Could not load social links.");
        }

        if (!isMounted) return;

        const nextValues = { ...EMPTY_LINKS };
        for (const link of data.links || []) {
          if (link.platform in nextValues) {
            nextValues[link.platform] = link.url || "";
          }
        }

        setValues(nextValues);
        setState("idle");
      } catch (loadError) {
        if (!isMounted) return;

        console.warn("Profile social links load failed", {
          message: loadError instanceof Error ? loadError.message : "unknown_error",
        });
        setError("load_failed");
        setState("error");
      }
    }

    loadSocialLinks();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateLink(platform: Platform, url: string) {
    setValues((currentValues) => ({ ...currentValues, [platform]: url }));
    setError("");
    if (state === "success") setState("idle");
  }

  function clearLink(platform: Platform) {
    updateLink(platform, "");
  }

  async function saveSocialLinks() {
    const payload = buildPayload(values);

    for (const link of payload) {
      if (link.url.length > 300) {
        setError("url_too_long");
        setState("error");
        return;
      }

      if (!isValidHttpUrl(link.url)) {
        setError("invalid_url");
        setState("error");
        return;
      }
    }

    setState("saving");
    setError("");

    try {
      const response = await fetch("/api/customer/social-links", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ links: payload }),
      });
      const data = (await response.json().catch(() => ({}))) as SocialLinksResponse;

      if (!response.ok) {
        throw new Error(data.error || "Could not save social links.");
      }

      const nextValues = { ...EMPTY_LINKS };
      for (const link of data.links || []) {
        if (link.platform in nextValues) {
          nextValues[link.platform] = link.url || "";
        }
      }

      setValues(nextValues);
      setState("success");
    } catch (saveError) {
      console.warn("Profile social links save failed", {
        message: saveError instanceof Error ? saveError.message : "unknown_error",
      });
      setError("save_failed");
      setState("error");
    }
  }

  const isBusy = state === "loading" || state === "saving";

  return (
    <section className="gb-account-section">
      <div style={{ alignItems: "flex-start", display: "flex", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <span className="badge badge-gold">
            <T en="Social links" ar="روابط التواصل" />
          </span>
          <p className="admin-muted-line" style={{ marginTop: 10 }}>
            <T
              en="Add customer-safe social links to your GearBeat profile. Empty fields are ignored, and clearing every field removes all saved links."
              ar="أضف روابط تواصل آمنة إلى ملفك في GearBeat. يتم تجاهل الحقول الفارغة، ومسح كل الحقول يزيل كل الروابط المحفوظة."
            />
          </p>
        </div>

        <span className={hasAnyValue ? "gb-chip gb-chip-success" : "gb-chip"}>
          <T
            en={hasAnyValue ? "Ready to save" : "No links added"}
            ar={hasAnyValue ? "جاهزة للحفظ" : "لا توجد روابط"}
          />
        </span>
      </div>

      <div className="gb-social-link-grid" aria-busy={isBusy}>
        {SOCIAL_LINK_PLATFORMS.map((item) => (
          <label key={item.platform}>
            <span style={{ alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 8 }}>
              <T en={item.en} ar={item.ar} />
              {values[item.platform] ? (
                <button
                  className="gb-chip"
                  disabled={isBusy}
                  onClick={() => clearLink(item.platform)}
                  type="button"
                >
                  <T en="Clear" ar="مسح" />
                </button>
              ) : null}
            </span>
            <input
              className="input"
              disabled={isBusy}
              maxLength={300}
              onChange={(event) => updateLink(item.platform, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              placeholder={item.placeholder}
              type="url"
              value={values[item.platform]}
            />
          </label>
        ))}
      </div>

      <div style={{ alignItems: "center", display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <button
          className="btn btn-secondary"
          disabled={isBusy}
          onClick={saveSocialLinks}
          type="button"
        >
          <T
            en={state === "saving" ? "Saving..." : "Save social links"}
            ar={state === "saving" ? "جاري الحفظ..." : "حفظ روابط التواصل"}
          />
        </button>

        {state === "loading" ? (
          <span className="gb-chip">
            <T en="Loading links..." ar="جاري تحميل الروابط..." />
          </span>
        ) : null}

        {state === "success" ? (
          <span className="gb-chip gb-chip-success">
            <T en="Social links saved" ar="تم حفظ روابط التواصل" />
          </span>
        ) : null}

        {state === "error" ? (
          <span className="gb-chip" role="alert">
            {error === "invalid_url" ? (
              <T
                en="Use links that start with http:// or https://."
                ar="استخدم روابط تبدأ بـ http:// أو https://."
              />
            ) : error === "url_too_long" ? (
              <T
                en="Each link must be 300 characters or less."
                ar="يجب ألا يتجاوز كل رابط 300 حرف."
              />
            ) : error === "load_failed" ? (
              <T
                en="Could not load social links. Try refreshing the page."
                ar="تعذر تحميل روابط التواصل. جرّب تحديث الصفحة."
              />
            ) : (
              <T
                en="Could not save social links. Please try again."
                ar="تعذر حفظ روابط التواصل. الرجاء المحاولة مرة أخرى."
              />
            )}
          </span>
        ) : null}
      </div>
    </section>
  );
}
