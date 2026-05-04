"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import T from "@/components/t";
import { signOutAction } from "@/lib/actions";

export function AdminSidebar({ 
  sellerLeadCount, 
  studioLeadCount 
}: { 
  sellerLeadCount: number; 
  studioLeadCount: number; 
}) {
  const pathname = usePathname();
  const [sellersOpen, setSellersOpen] = useState(true);
  const [studiosOpen, setStudiosOpen] = useState(true);

  const isActive = (path: string) => pathname === path;

  return (
    <aside style={{ 
      width: 280, 
      background: '#0a0a0a', 
      borderRight: '1px solid #1a1a1a', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '24px 0',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {/* Logo Area */}
      <div style={{ padding: '0 24px 32px', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-1px' }}>
        GearBeat Admin
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {/* SECTION 1: Overview */}
        <div style={sectionHeaderStyle}>
          <T en="Overview" ar="نظرة عامة" />
        </div>
        <NavItem href="/admin" icon="📊" labelEn="Dashboard" labelAr="لوحة التحكم" active={isActive('/admin')} />

        {/* SECTION 2: Sellers */}
        <div onClick={() => setSellersOpen(!sellersOpen)} style={collapsibleHeaderStyle}>
          <span>🏪 <T en="Sellers" ar="التجار" /></span>
          <span style={{ fontSize: '0.7rem' }}>{sellersOpen ? '▼' : '▶'}</span>
        </div>
        {sellersOpen && (
          <div style={{ display: 'grid', gap: 2 }}>
            <NavItem href="/admin/leads?type=seller" icon="📝" labelEn="Applications" labelAr="طلبات الانضمام" active={pathname.includes('/leads') && pathname.includes('type=seller')} badge={sellerLeadCount} />
            <NavItem href="/admin/sellers" icon="🏢" labelEn="Approved Sellers" labelAr="التجار المعتمدون" active={isActive('/admin/sellers')} />
            <NavItem href="/admin/products" icon="📦" labelEn="Products" labelAr="المنتجات" active={isActive('/admin/products')} />
            <NavItem href="/admin/marketplace-orders" icon="🛒" labelEn="Orders" labelAr="الطلبات" active={isActive('/admin/marketplace-orders')} />
            <NavItem href="/admin/seller-payments" icon="💳" labelEn="Payments" labelAr="المدفوعات" active={isActive('/admin/seller-payments')} />
            <NavItem href="/admin/seller-settlements" icon="⚖️" labelEn="Settlements" labelAr="التسويات" active={isActive('/admin/seller-settlements')} />
          </div>
        )}

        {/* SECTION 3: Studios */}
        <div onClick={() => setStudiosOpen(!studiosOpen)} style={collapsibleHeaderStyle}>
          <span>🎙️ <T en="Studios" ar="الاستوديوهات" /></span>
          <span style={{ fontSize: '0.7rem' }}>{studiosOpen ? '▼' : '▶'}</span>
        </div>
        {studiosOpen && (
          <div style={{ display: 'grid', gap: 2 }}>
            <NavItem href="/admin/leads?type=studio" icon="📝" labelEn="Applications" labelAr="طلبات الانضمام" active={pathname.includes('/leads') && pathname.includes('type=studio')} badge={studioLeadCount} />
            <NavItem href="/admin/studios" icon="🏢" labelEn="Approved Studios" labelAr="الاستوديوهات المعتمدة" active={isActive('/admin/studios')} />
            <NavItem href="/admin/bookings" icon="📅" labelEn="Bookings" labelAr="الحجوزات" active={isActive('/admin/bookings')} />
            <NavItem href="/admin/studio-payments" icon="💳" labelEn="Payments" labelAr="المدفوعات" active={isActive('/admin/studio-payments')} />
            <NavItem href="/admin/studio-settlements" icon="⚖️" labelEn="Settlements" labelAr="التسويات" active={isActive('/admin/studio-settlements')} />
          </div>
        )}

        {/* SECTION 4: General */}
        <div style={sectionHeaderStyle}>
          <T en="General" ar="عام" />
        </div>
        <NavItem href="/admin/reviews" icon="⭐" labelEn="Reviews" labelAr="التقييمات" active={isActive('/admin/reviews')} />
        <NavItem href="/admin/onboarding-setup" icon="🧪" labelEn="Test Onboarding" labelAr="اختبار الربط" active={isActive('/admin/onboarding-setup')} />
        <NavItem href="/admin/reports" icon="📈" labelEn="Reports" labelAr="التقارير" active={isActive('/admin/reports')} />
        <NavItem href="/admin/settings" icon="⚙️" labelEn="Settings" labelAr="الإعدادات" active={isActive('/admin/settings')} />
      </div>

      {/* SECTION 5: Bottom */}
      <div style={{ padding: '24px 12px 0', borderTop: '1px solid #1a1a1a', display: 'grid', gap: 8 }}>
        <button style={{ background: 'transparent', border: 'none', color: '#888', textAlign: 'left', padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>
          🌐 EN | AR
        </button>
        <form action={signOutAction}>
          <button style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            🚪 <T en="Logout" ar="تسجيل الخروج" />
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-item:hover { background: rgba(255,255,255,0.03); color: #f5f1e8; }
        .nav-item.active { background: rgba(207,168,110,0.08); color: #cfa86e !important; }
      `}} />
    </aside>
  );
}

function NavItem({ href, icon, labelEn, labelAr, active, badge }: any) {
  return (
    <Link href={href} className={`nav-item ${active ? 'active' : ''}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '10px 12px', 
      borderRadius: 8, 
      textDecoration: 'none', 
      color: active ? '#cfa86e' : '#888',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <T en={labelEn} ar={labelAr} />
      </div>
      {badge > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  color: '#cfa86e',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  padding: '0 12px',
  marginTop: 24,
  marginBottom: 8,
  letterSpacing: '1px'
};

const collapsibleHeaderStyle: React.CSSProperties = {
  ...sectionHeaderStyle,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  paddingRight: 16
};
