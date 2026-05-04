"use client";

import { useEffect } from "react";
import T from "@/components/t";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Page Error:", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, color: "#fff" }}>
      <div style={{ maxWidth: 500, width: "100%", background: "#111", borderRadius: 24, border: "1px solid #ef4444", padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 24 }}>⚠️</div>
        <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>
          <T en="Something went wrong" ar="حدث خطأ ما" />
        </h1>
        <p style={{ color: "#888", marginBottom: 40, lineHeight: 1.6 }}>
          {error.message || <T en="An unexpected error occurred in the administrative panel." ar="حدث خطأ غير متوقع في لوحة الإدارة." />}
        </p>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button 
            onClick={() => reset()}
            className="btn"
            style={{ height: 48, padding: '0 24px', borderRadius: 8, background: '#222', color: '#fff', border: '1px solid #333', cursor: 'pointer' }}
          >
            <T en="Try Again" ar="حاول مرة أخرى" />
          </button>
          
          <Link 
            href="/admin" 
            className="btn btn-primary" 
            style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}
          >
            <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>
        </div>
      </div>
    </main>
  );
}
