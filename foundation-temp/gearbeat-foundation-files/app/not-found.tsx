import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ maxWidth: 560, textAlign: "center" }}>
        <h1>Page not found</h1>
        <p>الصفحة المطلوبة غير موجودة.</p>
        <Link href="/">Back home / العودة للرئيسية</Link>
      </section>
    </main>
  );
}
