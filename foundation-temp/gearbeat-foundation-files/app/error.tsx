"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ maxWidth: 560, textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
        <button type="button" onClick={() => reset()}>
          Try again / حاول مرة أخرى
        </button>
      </section>
    </main>
  );
}
