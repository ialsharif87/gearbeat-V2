type SocialLinksProps = {
  variant?: "compact" | "large";
};

const socials = [
  {
    name: "Instagram",
    label: "IG",
    href: "#",
    className: "social-instagram"
  },
  {
    name: "TikTok",
    label: "TT",
    href: "#",
    className: "social-tiktok"
  },
  {
    name: "X",
    label: "X",
    href: "#",
    className: "social-x"
  },
  {
    name: "YouTube",
    label: "YT",
    href: "#",
    className: "social-youtube"
  },
  {
    name: "LinkedIn",
    label: "IN",
    href: "#",
    className: "social-linkedin"
  }
];

export default function SocialLinks({ variant = "compact" }: SocialLinksProps) {
  return (
    <div className={variant === "large" ? "brand-socials large" : "brand-socials"}>
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          aria-label={social.name}
          className={`brand-social ${social.className}`}
        >
          <span>{social.label}</span>

          {variant === "large" ? <strong>{social.name}</strong> : null}
        </a>
      ))}
    </div>
  );
}
