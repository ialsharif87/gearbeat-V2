type GearBeatLogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showTagline?: boolean;
};

const logoSizes = {
  sm: { width: 220, height: 64 },
  md: { width: 300, height: 86 },
  lg: { width: 420, height: 120 },
};

export default function GearBeatLogo({
  size = "md",
  variant = "dark",
  showTagline = true,
}: GearBeatLogoProps) {
  const currentSize = logoSizes[size];
  const wordColor = variant === "dark" ? "#F4F1EA" : "#0B0F16";
  const wordShadow = variant === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)";

  return (
    <svg
      width={currentSize.width}
      height={currentSize.height}
      viewBox="0 0 420 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GearBeat"
      className="gb-logo-svg"
    >
      <defs>
        <linearGradient id="gbIconGold" x1="20" y1="10" x2="112" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE9A6" />
          <stop offset="0.33" stopColor="#D4AF37" />
          <stop offset="0.68" stopColor="#B28223" />
          <stop offset="1" stopColor="#7A5514" />
        </linearGradient>

        <linearGradient id="gbIconGoldSoft" x1="35" y1="22" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6CE" />
          <stop offset="0.55" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#9D721C" />
        </linearGradient>

        <linearGradient id="gbWordMetal" x1="140" y1="34" x2="410" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={wordColor} />
          <stop offset="0.55" stopColor={wordColor} />
          <stop offset="1" stopColor={variant === "dark" ? "#C9CED8" : "#1B2430"} />
        </linearGradient>

        <filter id="gbIconShadow" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.34" />
        </filter>

        <filter id="gbWordShadow" x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={wordShadow} floodOpacity="1" />
        </filter>
      </defs>

      <g filter="url(#gbIconShadow)">
        <path
          d="M66 10L109 35L96 55L66 38L34 57V66L66 84L91 69H72V51H115V79L66 108L16 79V41L66 10Z"
          fill="url(#gbIconGold)"
        />

        <path
          d="M66 39L86 51L77 64L66 58L55 64L66 71L78 64H97L66 83L38 67V56L66 39Z"
          fill="#0B0F16"
          opacity="0.96"
        />

        <rect x="39" y="54" width="4.5" height="14" rx="2.25" fill="#FFF3BE" />
        <rect x="47" y="46" width="4.5" height="30" rx="2.25" fill="#D4AF37" />
        <rect x="55" y="38" width="4.5" height="46" rx="2.25" fill="#FFF3BE" />
        <rect x="63" y="46" width="4.5" height="30" rx="2.25" fill="#D4AF37" />
        <rect x="71" y="54" width="4.5" height="14" rx="2.25" fill="#FFF3BE" />
      </g>

      <g filter="url(#gbWordShadow)">
        <text
          x="140"
          y="68"
          fill="url(#gbWordMetal)"
          fontFamily="Space Grotesk, Inter, Arial, sans-serif"
          fontSize="45"
          fontWeight="500"
          letterSpacing="0.5"
        >
          GearBeat
        </text>
      </g>

      {showTagline ? (
        <text
          x="143"
          y="96"
          fill="#D4AF37"
          fontFamily="Space Grotesk, Inter, Arial, sans-serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="6"
        >
          STUDIO · SOUND · CONNECTED.
        </text>
      ) : null}
    </svg>
  );
}
