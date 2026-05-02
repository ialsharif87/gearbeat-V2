"use client";

import { type FormEvent, useState } from "react";
import T from "@/components/t";

type VendorProductImageUploadBoxProps = {
  productId: string;
};

type UploadResult = {
  ok?: boolean;
  imageUrl?: string;
  message?: string;
  error?: string;
};

export default function VendorProductImageUploadBox({
  productId,
}: VendorProductImageUploadBoxProps) {
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || !file.name) {
      setResult({
        ok: false,
        error: "Please choose an image file first.",
      });
      return;
    }

    formData.set("product_id", productId);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/vendor/products/images/upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        window.location.href = "/login?account=vendor";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not upload image.");
      }

      setResult(data);

      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      console.error("Product image upload failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error ? error.message : "Could not upload image.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gap: 14,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(207,167,98,0.18)",
      }}
    >
      <div>
        <span className="badge badge-gold">
          <T en="Product Images" ar="صور المنتج" />
        </span>

        <h3 style={{ marginTop: 10 }}>
          <T en="Upload product image" ar="رفع صورة المنتج" />
        </h3>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <T
            en="Upload JPG, PNG, WEBP, or GIF image up to 10MB. The image will be added to the product gallery."
            ar="ارفع صورة JPG أو PNG أو WEBP أو GIF حتى 10MB. سيتم إضافتها إلى صور المنتج."
          />
        </p>
      </div>

      <form onSubmit={submitUpload} style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="product_id" value={productId} readOnly />

        <label
          className="card"
          style={{
            cursor: "pointer",
            borderStyle: "dashed",
            borderColor: "rgba(207,167,98,0.35)",
            textAlign: "center",
          }}
        >
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name || "");

              if (file) {
                setPreviewUrl(URL.createObjectURL(file));
              } else {
                setPreviewUrl("");
              }
            }}
          />

          <strong>
            <T en="Choose image" ar="اختر صورة" />
          </strong>

          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            {fileName || "No image selected"}
          </p>

          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              style={{
                margin: "12px auto 0",
                width: 160,
                height: 160,
                objectFit: "cover",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
          ) : null}
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !fileName}
        >
          {loading ? (
            <T en="Uploading..." ar="جاري الرفع..." />
          ) : (
            <T en="Upload image" ar="رفع الصورة" />
          )}
        </button>
      </form>

      {result ? (
        <div
          className="card"
          style={{
            borderColor: result.ok
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,77,77,0.25)",
            background: result.ok
              ? "rgba(0,255,136,0.06)"
              : "rgba(255,77,77,0.06)",
          }}
        >
          <strong style={{ color: result.ok ? "#baffd7" : "#ffb0b0" }}>
            {result.ok ? result.message : result.error}
          </strong>

          {result.imageUrl ? (
            <code
              style={{
                display: "block",
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                background: "rgba(0,0,0,0.35)",
                wordBreak: "break-all",
              }}
            >
              {result.imageUrl}
            </code>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
