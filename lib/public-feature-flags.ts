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
      en: "Planned learning experiences for music and audio creators. Details will be announced when the Academy is ready.",
      ar: "تجارب تعليمية مخطط لها لمبدعي الموسيقى والصوت. سيتم إعلان التفاصيل عند جاهزية الأكاديمية.",
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
      en: "A planned directory for sound and creative services. This feature is still under development.",
      ar: "دليل مخطط للخدمات الصوتية والإبداعية. هذه الميزة ما زالت قيد التطوير.",
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
      en: "Event discovery and ticketing are planned for a later release.",
      ar: "اكتشاف الفعاليات وحجز التذاكر مخطط لهما في إصدار لاحق.",
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
      en: "Creative experiences and community activities are planned for a later release.",
      ar: "التجارب الإبداعية والأنشطة المجتمعية مخطط لها في إصدار لاحق.",
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
      en: "Additional partner programs are being prepared and will open gradually.",
      ar: "يتم تجهيز برامج شركاء إضافية وسيتم فتحها تدريجيًا.",
    },
    safeStatusIndicator: {
      en: "Launching soon",
      ar: "قريباً",
    }
  }
];
