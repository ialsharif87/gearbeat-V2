import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Creative Audio Services",
  description: "Book professional mixing, mastering, production, and voiceover services from GearBeat verified providers and top-tier music studios.",
};

export const dynamic = "force-dynamic";

type ServiceFeature = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  category: string;
  icon: string | null;
};

type StudioWithServices = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  cover_image_url: string | null;
  price_from: number | null;
  verified: boolean;
  instant_booking_enabled: boolean;
  services: string[];
  service_slugs: string[];
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: activeServiceSlug } = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Unique Services (that are offered by approved/verified studios)
  const { data: rawServices } = await supabase
    .from("studio_features")
    .select(`
      id,
      name_en,
      name_ar,
      slug,
      category,
      icon,
      studio_feature_links!inner (
        studio_id,
        studios!inner (
          status,
          verified
        )
      )
    `)
    .eq("category", "service")
    .eq("studio_feature_links.studios.status", "approved")
    .eq("studio_feature_links.studios.verified", true)
    .order("name_en");

  // Deduplicate services (since one service can have multiple links)
  const services: ServiceFeature[] = [];
  const seenIds = new Set<string>();

  (rawServices || []).forEach((item: any) => {
    if (!seenIds.has(item.id)) {
      services.push({
        id: item.id,
        name_en: item.name_en,
        name_ar: item.name_ar,
        slug: item.slug,
        category: item.category,
        icon: item.icon,
      });
      seenIds.add(item.id);
    }
  });

  // 2. Fetch Studios that offer services
  const { data: rawStudios } = await supabase
    .from("studios")
    .select(`
      id,
      name,
      slug,
      city,
      cover_image_url,
      price_from,
      verified,
      instant_booking_enabled,
      studio_feature_links!inner (
        feature:studio_features!inner (
          id,
          name_en,
          name_ar,
          slug,
          category
        )
      )
    `)
    .eq("status", "approved")
    .eq("verified", true)
    .eq("studio_feature_links.feature.category", "service");

  // Process raw data into a clean structure
  let studios: StudioWithServices[] = (rawStudios || []).map((s: any) => {
    const featureLinks = Array.isArray(s.studio_feature_links) 
      ? s.studio_feature_links 
      : [s.studio_feature_links];
    
    const serviceList = featureLinks
      .map((link: any) => link.feature?.name_en)
      .filter(Boolean);
    
    const slugList = featureLinks
      .map((link: any) => link.feature?.slug)
      .filter(Boolean);

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      city: s.city,
      cover_image_url: s.cover_image_url,
      price_from: s.price_from,
      verified: !!s.verified,
      instant_booking_enabled: !!s.instant_booking_enabled,
      services: serviceList,
      service_slugs: slugList,
    };
  });

  // Filter by service if selected
  if (activeServiceSlug) {
    studios = studios.filter((s) => s.service_slugs.includes(activeServiceSlug));
  }

  return (
    <div className="services-page">
      {/* HERO SECTION */}
      <section 
        className="section-padding hero-section" 
        style={{ 
          background: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop') center/cover",
          textAlign: "center",
          padding: "120px 20px"
        }}
      >
        <div className="container">
          <div className="badge-gold mb-24 ms-auto me-auto"><T en="Professional Audio Services" ar="خدمات الصوت الاحترافية" /></div>
          <h1 className="text-balance" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, marginBottom: 24 }}>
            <T en="Book Creative Services" ar="احجز الخدمات الإبداعية" />
          </h1>
          <p className="text-balance" style={{ fontSize: "1.2rem", color: "var(--gb-text-muted)", maxWidth: 700, marginInline: "auto" }}>
            <T 
              en="Mixing, mastering, production, voiceover and more from verified providers who meet the GearBeat standard of excellence." 
              ar="مكس، ماستر، إنتاج، تعليق صوتي والمزيد من مزودين موثقين يستوفون معايير التميز في GearBeat." 
            />
          </p>
        </div>
      </section>

      <div className="section-padding" style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* FILTER BAR */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/services"
              className={`badge ${!activeServiceSlug ? "badge-gold" : ""}`}
              style={{ padding: "10px 20px", fontSize: "0.95rem", cursor: "pointer", border: "1px solid var(--gb-border)" }}
            >
              <T en="All Services" ar="جميع الخدمات" />
            </Link>
            {services.map((svc) => (
              <Link
                key={svc.id}
                href={`/services?service=${svc.slug}`}
                className={`badge ${activeServiceSlug === svc.slug ? "badge-gold" : ""}`}
                style={{ 
                  padding: "10px 20px", 
                  fontSize: "0.95rem", 
                  cursor: "pointer", 
                  border: "1px solid var(--gb-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                {svc.icon && <span>{svc.icon}</span>}
                <T en={svc.name_en} ar={svc.name_ar} />
              </Link>
            ))}
          </div>
        </div>

        {/* STUDIOS GRID */}
        {studios.length > 0 ? (
          <div className="grid grid-3" style={{ gap: 30 }}>
            {studios.map((studio) => (
              <Link 
                key={studio.id} 
                href={`/studios/${studio.slug}`}
                className="card"
                style={{ padding: 0, overflow: "hidden", display: "block", color: "inherit", textDecoration: "none" }}
              >
                <div style={{ position: "relative", aspectRatio: "16/10" }}>
                  <Image 
                    src={studio.cover_image_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop"} 
                    alt={studio.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover", borderRadius: 'var(--gb-radius-md) var(--gb-radius-md) 0 0' }}
                  />
                  {studio.verified && (
                    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1 }} className="badge badge-success">
                      ✓ <T en="Verified" ar="موثق" />
                    </div>
                  )}
                </div>
                
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{studio.name}</h3>
                    <div style={{ color: "var(--gb-gold)", fontWeight: 700 }}>
                      {studio.price_from ? `${studio.price_from} ` : "—"}
                      {studio.price_from ? <T en="SAR" ar="ر.س" /> : ""}
                    </div>
                  </div>
                  
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {studio.city || <T en="Saudi Arabia" ar="المملكة العربية السعودية" />}
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {studio.services.slice(0, 3).map((svcName, idx) => (
                      <span key={idx} className="badge" style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)" }}>
                        {svcName}
                      </span>
                    ))}
                    {studio.services.length > 3 && (
                      <span className="badge" style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)" }}>
                        +{studio.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--muted)" }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gb-gold)' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>
              <T en="No service providers found" ar="لم يتم العثور على مزودي خدمة" />
            </h3>
            <p>
              <T en="Try selecting a different service or check back later." ar="حاول اختيار خدمة أخرى أو عد لاحقاً." />
            </p>
            <Link href="/services" className="btn btn-secondary" style={{ marginTop: 20 }}>
              <T en="Clear Filters" ar="مسح الفلاتر" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
