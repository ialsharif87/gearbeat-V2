"use client";

import { useState } from "react";
import T from "@/components/t";

type ShareType = "studio" | "product" | "vendor" | "booking" | "offer" | "general";

type ShareButtonProps = {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  shareType?: ShareType;
  studioId?: string;
  productId?: string;
  vendorId?: string;
  referralCode?: string;
  showWhatsApp?: boolean;
};

function getCurrentUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

function addReferralToUrl(url: string, referralCode?: string) {
  if (!url || !referralCode) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("ref", referralCode);
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function canUseNativeShare() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithShare = navigator as Navigator & {
    share?: (data?: ShareData) => Promise<void>;
  };

  return typeof navigatorWithShare.share === "function";
}

async function trackShare({
  shareType,
  studioId,
  productId,
  vendorId,
  referralCode,
  channel,
  sharedUrl,
}: {
  shareType: ShareType;
  studioId?: string;
  productId?: string;
  vendorId?: string;
  referralCode?: string;
  channel: string;
  sharedUrl: string;
}) {
  try {
    await fetch("/api/share/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shareType,
        studioId,
        productId,
        vendorId,
        referralCode,
        channel,
        sharedUrl,
      }),
    });
  } catch (error) {
    console.warn("Share tracking failed:", error);
  }
}

export default function ShareButton({
  title,
  text,
  url,
  className = "btn",
  shareType = "general",
  studioId,
  productId,
  vendorId,
  referralCode,
  showWhatsApp = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const baseUrl = url || getCurrentUrl();
  const finalUrl = addReferralToUrl(baseUrl, referralCode);

  async function handleNativeShare() {
    const shareData = {
      title,
      text: text || title,
      url: finalUrl,
    };

    try {
      if (canUseNativeShare()) {
        const navigatorWithShare = navigator as Navigator & {
          share: (data?: ShareData) => Promise<void>;
        };

        await navigatorWithShare.share(shareData);

        await trackShare({
          shareType,
          studioId,
          productId,
          vendorId,
          referralCode,
          channel: "native",
          sharedUrl: finalUrl,
        });

        return;
      }

      await handleCopy();
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(finalUrl);

      setCopied(true);
      setOpen(false);

      await trackShare({
        shareType,
        studioId,
        productId,
        vendorId,
        referralCode,
        channel: "copy_link",
        sharedUrl: finalUrl,
      });

      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function handleWhatsAppShare() {
    const message = `${text || title}\n${finalUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    await trackShare({
      shareType,
      studioId,
      productId,
      vendorId,
      referralCode,
      channel: "whatsapp",
      sharedUrl: finalUrl,
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className={className}
        onClick={() => {
          if (canUseNativeShare()) {
            handleNativeShare();
            return;
          }

          setOpen((value) => !value);
        }}
      >
        {copied ? (
          <T en="Link copied" ar="تم نسخ الرابط" />
        ) : (
          <T en="Share" ar="مشاركة" />
        )}
      </button>

      {open ? (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 30,
            minWidth: 220,
            padding: 12,
            display: "grid",
            gap: 8,
            boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          }}
        >
          <button type="button" className="btn" onClick={handleCopy}>
            <T en="Copy link" ar="نسخ الرابط" />
          </button>

          {showWhatsApp ? (
            <button type="button" className="btn" onClick={handleWhatsAppShare}>
              <T en="Share on WhatsApp" ar="مشاركة عبر واتساب" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
