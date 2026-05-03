"use client";

import { useState } from "react";
import Link from "next/link";
import T from "@/components/t";

type FAQItemProps = {
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
};

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="card" 
      style={{ 
        padding: 0, 
        overflow: "hidden", 
        marginBottom: 12, 
        borderColor: isOpen ? "var(--gb-gold)" : "rgba(255,255,255,0.08)",
        transition: "all 0.3s ease"
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          textAlign: "inherit",
          cursor: "pointer",
          color: "inherit",
          font: "inherit",
          fontWeight: 600,
        }}
      >
        <T en={question.en} ar={question.ar} />
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.3s ease",
          fontSize: "1.2rem"
        }}>
          ▾
        </span>
      </button>
      
      {isOpen && (
        <div style={{ 
          padding: "0 24px 20px 24px", 
          color: "var(--muted)", 
          lineHeight: 1.7,
          fontSize: "0.95rem",
          animation: "fadeIn 0.3s ease forwards"
        }}>
          <T en={answer.en} ar={answer.ar} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default function HelpPage() {
  const customerFaqs = [
    {
      question: { en: "How do I book a studio?", ar: "كيف أحجز استوديو؟" },
      answer: { en: "Browse studios, choose your preferred space, select a time slot, and complete payment.", ar: "تصفح الاستوديوهات، اختر المساحة المناسبة، حدد الوقت، وأكمل الدفع." }
    },
    {
      question: { en: "Can I cancel my booking?", ar: "هل يمكنني إلغاء الحجز؟" },
      answer: { en: "Yes. Cancellation policies vary by studio. Check the studio's policy before booking.", ar: "نعم. تختلف سياسات الإلغاء حسب الاستوديو. راجع السياسة قبل الحجز." }
    },
    {
      question: { en: "How do I return a product?", ar: "كيف أرجع منتجاً؟" },
      answer: { en: "Contact the seller through your orders page and follow the return instructions.", ar: "تواصل مع البائع من صفحة طلباتك واتبع تعليمات الإرجاع." }
    }
  ];

  const providerFaqs = [
    {
      question: { en: "How do I list my studio?", ar: "كيف أسجل استوديوهي؟" },
      answer: { en: "Fill out the interest form at /join/studio and our team will contact you within 2 business days.", ar: "اكمل نموذج الاهتمام في /join/studio وسيتواصل فريقنا معك خلال يومي عمل." }
    },
    {
      question: { en: "How do I get paid?", ar: "كيف أستلم مستحقاتي؟" },
      answer: { en: "Earnings are settled after booking completion. Request a payout from your portal.", ar: "تُسوَّى المستحقات بعد اكتمال الحجز. اطلب صرفها من بوابتك." }
    }
  ];

  return (
    <main className="help-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", marginBottom: 60 }}>
        <span className="badge badge-gold">
          <T en="Support" ar="الدعم" />
        </span>
        <h1 style={{ fontSize: "3rem", marginTop: 16 }}>
          <T en="Help Center" ar="مركز المساعدة" />
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
          <T en="Find answers to common questions." ar="اعثر على إجابات للأسئلة الشائعة." />
        </p>
      </section>

      {/* FAQs */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 24, fontSize: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
          <T en="For Customers" ar="للعملاء" />
        </h2>
        {customerFaqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </section>

      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 24, fontSize: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
          <T en="For Studios & Sellers" ar="للاستوديوهات والتجار" />
        </h2>
        {providerFaqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </section>

      {/* Contact CTA */}
      <section style={{ textAlign: "center", padding: "40px", borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: 12 }}>
          <T en="Still need help?" ar="لا تزال بحاجة للمساعدة؟" />
        </h3>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          <T en="Our support team is here to assist you with any inquiries." ar="فريق الدعم لدينا هنا لمساعدتك في أي استفسارات." />
        </p>
        <Link href="/contact" className="btn btn-primary">
          <T en="Contact Support" ar="تواصل مع الدعم" />
        </Link>
      </section>
    </main>
  );
}
