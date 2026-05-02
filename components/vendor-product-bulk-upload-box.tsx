"use client";

import { type FormEvent, useState } from "react";
import T from "@/components/t";

type UploadResult = {
  ok?: boolean;
  batchId?: string | null;
  totalRows?: number;
  successCount?: number;
  errorCount?: number;
  results?: {
    rowNumber: number;
    sku?: string;
    status: "success" | "error";
    productId?: string;
    message?: string;
  }[];
  message?: string;
  error?: string;
};

export default function VendorProductBulkUploadBox() {
  const [fileName, setFileName] = useState("");
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
        error: "Please choose an XLSX or CSV file first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/vendor/products/bulk-upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        window.location.href = "/login?account=vendor";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not upload products.");
      }

      setResult(data);
      form.reset();
      setFileName("");
    } catch (error) {
      console.error("Bulk upload failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not upload products.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ display: "grid", gap: 18 }}>
      <div>
        <span className="badge badge-gold">
          <T en="Bulk Upload" ar="رفع جماعي" />
        </span>

        <h2 style={{ marginTop: 10 }}>
          <T en="Upload products by Excel" ar="رفع المنتجات عن طريق Excel" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Download the template, fill it in Excel, add image URLs, then upload it here. Products will be saved as pending review."
            ar="نزّل القالب، عبّئه في Excel، أضف روابط الصور، ثم ارفعه هنا. سيتم حفظ المنتجات بحالة انتظار مراجعة الإدارة."
          />
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a
          href="/api/vendor/products/bulk-template"
          className="btn btn-primary"
        >
          <T en="Download XLSX template" ar="تنزيل قالب Excel XLSX" />
        </a>
      </div>

      <form onSubmit={submitUpload} style={{ display: "grid", gap: 14 }}>
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
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name || "");
            }}
          />

          <strong>
            <T en="Choose Excel or CSV file" ar="اختر ملف Excel أو CSV" />
          </strong>

          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            {fileName || "gearbeat-product-upload-template.xlsx"}
          </p>
        </label>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? (
            <T en="Uploading..." ar="جاري الرفع..." />
          ) : (
            <T en="Upload products" ar="رفع المنتجات" />
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
          <h3 style={{ color: result.ok ? "#baffd7" : "#ffb0b0" }}>
            {result.ok ? (
              <T en="Upload complete" ar="اكتمل الرفع" />
            ) : (
              <T en="Upload failed" ar="فشل الرفع" />
            )}
          </h3>

          <p style={{ color: result.ok ? "#baffd7" : "#ffb0b0" }}>
            {result.message || result.error}
          </p>

          {result.ok ? (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <div className="card">
                <strong>{result.totalRows || 0}</strong>
                <div style={{ color: "var(--muted)" }}>
                  <T en="Rows" ar="صفوف" />
                </div>
              </div>

              <div className="card">
                <strong>{result.successCount || 0}</strong>
                <div style={{ color: "var(--muted)" }}>
                  <T en="Success" ar="نجحت" />
                </div>
              </div>

              <div className="card">
                <strong>{result.errorCount || 0}</strong>
                <div style={{ color: "var(--muted)" }}>
                  <T en="Errors" ar="أخطاء" />
                </div>
              </div>
            </div>
          ) : null}

          {result.results?.length ? (
            <div className="table-responsive" style={{ marginTop: 16 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.slice(0, 50).map((row) => (
                    <tr key={`${row.rowNumber}-${row.sku}`}>
                      <td>{row.rowNumber}</td>
                      <td>{row.sku || "—"}</td>
                      <td>
                        <span
                          className={
                            row.status === "success"
                              ? "badge badge-success"
                              : "badge badge-danger"
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>{row.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
