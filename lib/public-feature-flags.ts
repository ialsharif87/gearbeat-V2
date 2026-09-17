export type FeatureVisibilityStatus = 'hidden' | 'coming_soon' | 'admin_preview' | 'public';

export interface FeatureFlag {
  key: string;
  enLabel: string;
  arLabel: string;
  status: FeatureVisibilityStatus;
  showInHeader: boolean;
  showInFooter: boolean;
  showOnHomepage: boolean;
  adminPreviewAllowed: boolean;
  publicPath?: string;
  safeStatusLabel: {
    en: string;
    ar: string;
  };
  iconEmoji: string;
  description: {
    en: string;
    ar: string;
  };
  safeStatusIndicator: {
    en: string;
    ar: string;
  };
}

export const publicFeatureFlags: FeatureFlag[] = [
  {
    key: "academy",
    enLabel: "GearBeat Academy",
    arLabel: "أكاديمية جيربيت",
    status: "coming_soon",
    showInHeader: false,
    showInFooter: false,
    showOnHomepage: true,
    adminPreviewAllowed: true,
    publicPath: "/academy",
    safeStatusLabel: {
      en: "Coming Soon",
      ar: "قريباً",
    },
    iconEmoji: "🎓",
    description: {
      en: "Unlock masterclasses, certified sound training, and direct mentoring from industry-leading producers.",
      ar: "استكشف ورش العمل، التدريب الصوتي المعتمد، والتوجيه المباشر من منتجي الصوت الرائدين في المجال.",
    },
    safeStatusIndicator: {
      en: "Stay tuned",
      ar: "قريباً",
    }
  },
  {
    key: "services",
    enLabel: "Professional Services",
    arLabel: "الخدمات الاحترافية",
    status: "admin_preview",
    showInHeader: false,
    showInFooter: false,
    showOnHomepage: true,
    adminPreviewAllowed: true,
    publicPath: "/services",
    safeStatusLabel: {
      en: "Under Development",
      ar: "قيد التطوير",
    },
    iconEmoji: "🎚️",
    description: {
      en: "Hire verified mixing engineers, session musicians, voice talent, and master producers directly.",
      ar: "وظّف مهندسي مزج صوتي موثقين، عازفين، مؤدي أصوات، ومنتجين محترفين مباشرة لمشروعك القادم.",
    },
    safeStatusIndicator: {
      en: "Launching in Phase 2",
      ar: "الإطلاق في المرحلة الثانية",
    }
  },
  {
    key: "tickets",
    enLabel: "Event Ticketing",
    arLabel: "حجز تذاكر الفعاليات",
    status: "coming_soon",
    showInHeader: false,
    showInFooter: false,
    showOnHomepage: true,
    adminPreviewAllowed: true,
    publicPath: "/tickets",
    safeStatusLabel: {
      en: "Coming Soon",
      ar: "قريباً",
    },
    iconEmoji: "🎫",
    description: {
      en: "Browse and book entry to live recording sessions, gear demo workshops, and local sound experiences.",
      ar: "تصفح واحجز تذاكر حضور جلسات التسجيل الحية، وورش عمل تجربة المعدات، والتجارب الصوتية المحلية.",
    },
    safeStatusIndicator: {
      en: "Stay tuned",
      ar: "قريباً",
    }
  },
  {
    key: "experiences",
    enLabel: "Creative Experiences",
    arLabel: "التجارب الإبداعية",
    status: "coming_soon",
    showInHeader: false,
    showInFooter: false,
    showOnHomepage: true,
    adminPreviewAllowed: true,
    publicPath: "/experiences",
    safeStatusLabel: {
      en: "Coming Soon",
      ar: "قريباً",
    },
    iconEmoji: "🎧",
    description: {
      en: "Immerse yourself in specialized listening sessions, community meetups, and studio tours across the region.",
      ar: "انغمس في جلسات استماع متخصصة، لقاءات مجتمعية، وجولات استوديو فريدة من نوعها في المنطقة.",
    },
    safeStatusIndicator: {
      en: "Stay tuned",
      ar: "قريباً",
    }
  },
  {
    key: "partner_programs",
    enLabel: "Partner Programs",
    arLabel: "برامج الشركاء",
    status: "admin_preview",
    showInHeader: false,
    showInFooter: false,
    showOnHomepage: true,
    adminPreviewAllowed: true,
    safeStatusLabel: {
      en: "Under Development",
      ar: "قيد التطوير",
    },
    iconEmoji: "🤝",
    description: {
      en: "Unified registration for hardware vendors, educators, and organizers to offer products and services.",
      ar: "تسجيل موحد لموردي الأجهزة والمعلمين ومنظمي الفعاليات لتقديم منتجاتهم وخدماتهم الإبداعية.",
    },
    safeStatusIndicator: {
      en: "Launching soon",
      ar: "قريباً",
    }
  }
];
