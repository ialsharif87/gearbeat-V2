"use client";

import { useState } from "react";
import T from "@/components/t";

type ShareButtonProps = {
  title: string;
  text?: string;
  url?: string;
  className?: string;
};

export default function ShareButton({
  title,
  text,
  url,
  className = "btn",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl =
      url ||
      (typeof window !== "undefined" ? window.location.href : "");

    const shareData = {
      title,
      text: text || title,
      url: shareUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  return (
    <button type="button" className={className} onClick={handleShare}>
      {copied ? (
        <T en="Link copied" ar="تم نسخ الرابط" />
      ) : (
        <T en="Share" ar="مشاركة" />
      )}
    </button>
  );
}
