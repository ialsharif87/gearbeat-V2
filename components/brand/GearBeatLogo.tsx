type GearBeatLogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showTagline?: boolean;
};

export default function GearBeatLogo({
  size = "md",
  variant = "dark",
  showTagline = true,
}: GearBeatLogoProps) {
  return (
    <div
      className={`gb-logo gb-logo-${size} gb-logo-${variant}`}
      dir="ltr"
      aria-label="GearBeat"
    >
      <svg
        className="gb-logo-mark"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="gbGoldMark"
            x1="18"
            y1="10"
            x2="112"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFE9A6" />
            <stop offset="0.34" stopColor="#D4AF37" />
            <stop offset="0.7" stopColor="#B38322" />
            <stop offset="1" stopColor="#7A5514" />
          </linearGradient>

          <filter
            id="gbMarkShadow"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <g filter="url(#gbMarkShadow)">
          <path
            d="M66 10L109 35L96 55L66 38L34 57V66L66 84L91 69H72V51H115V79L66 108L16 79V41L66 10Z"
            fill="url(#gbGoldMark)"
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
      </svg>

      <div className="gb-logo-word-group">
        <div className="gb-logo-word">GearBeat</div>

        {showTagline ? (
          <div className="gb-logo-tagline">STUDIO · SOUND · CONNECTED.</div>
        ) : null}
      </div>
    </div>
  );
}
