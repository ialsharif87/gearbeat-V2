import T from "@/components/t";

export type StudioTier = 'verified' | 'trusted' | 'premium' | 'elite' | 'flagship';

interface StudioTierBadgeProps {
  tier: StudioTier;
  showIcon?: boolean;
}

export default function StudioTierBadge({ tier, showIcon = true }: StudioTierBadgeProps) {
  const config = {
    verified: {
      en: "Verified Studio",
      ar: "استوديو موثّق",
      color: "#94a3b8", // Silver/Slate
      icon: "✓",
      glow: "rgba(148, 163, 184, 0.2)"
    },
    trusted: {
      en: "Trusted Studio",
      ar: "استوديو موثوق",
      color: "#2dd4bf", // Teal
      icon: "🛡️",
      glow: "rgba(45, 212, 191, 0.2)"
    },
    premium: {
      en: "Premium Studio",
      ar: "استوديو مميز",
      color: "#cfa86e", // Gold
      icon: "💎",
      glow: "rgba(207, 168, 110, 0.3)"
    },
    elite: {
      en: "Elite Studio",
      ar: "استوديو نخبة",
      color: "#f59e0b", // Amber/Dark Gold
      icon: "👑",
      glow: "rgba(245, 158, 11, 0.4)"
    },
    flagship: {
      en: "GearBeat Flagship Studio",
      ar: "استوديو رئيسي معتمد من GearBeat",
      color: "#ffffff", // Pure White/Gold
      icon: "★",
      glow: "rgba(255, 255, 255, 0.4)",
      isFlagship: true
    }
  }[tier];

  return (
    <div className={`studio-badge tier-${tier} ${config.isFlagship ? 'flagship-pulse' : ''}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: config.color,
      border: `1px solid ${config.color}44`,
      background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${config.glow})`,
      boxShadow: `0 2px 10px ${config.glow}`,
      whiteSpace: 'nowrap'
    }}>
      {showIcon && <span style={{ fontSize: '0.9rem' }}>{config.icon}</span>}
      <T en={config.en} ar={config.ar} />

      <style dangerouslySetInnerHTML={{ __html: `
        .studio-badge {
          transition: all 0.3s ease;
          cursor: default;
        }
        .studio-badge:hover {
          transform: translateY(-1px);
          filter: brightness(1.2);
        }
        .flagship-pulse {
          animation: badge-pulse 2s infinite ease-in-out;
          border: 1.5px solid #cfa86e !important;
          color: #cfa86e !important;
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 5px rgba(207, 168, 110, 0.3); }
          50% { box-shadow: 0 0 15px rgba(207, 168, 110, 0.6); }
        }
      `}} />
    </div>
  );
}
