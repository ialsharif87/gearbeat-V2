import type { DashboardQuickLink } from "../components/dashboard-quick-links";

export const adminDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/admin",
    label: "Admin overview",
    label_ar: "نظرة عامة على الإدارة",
    description: "Main admin dashboard.",
  },
  {
    href: "/admin/products",
    label: "Product review",
    label_ar: "مراجعة المنتجات",
    description: "Review and manage marketplace products.",
  },
  {
    href: "/admin/catalog",
    label: "Catalog settings",
    label_ar: "إعدادات الكتالوج",
    description: "Manage categories, brands, and catalog data.",
  },
  {
    href: "/admin/marketplace-orders",
    label: "Marketplace orders",
    label_ar: "طلبات السوق",
    description: "Monitor customer marketplace orders.",
  },
  {
    href: "/admin/commission-settings",
    label: "Commission settings",
    label_ar: "إعدادات العمولة",
    description: "Set GearBeat commission from 10% to 30%.",
  },
  {
    href: "/admin/payouts",
    label: "Payouts & settlements",
    label_ar: "التحويلات والتسويات",
    description: "Review commission and net payable reports.",
  },
  {
    href: "/admin/system-health",
    label: "System health",
    label_ar: "صحة النظام",
    description: "Check core tables and production readiness.",
  },
  {
    href: "/admin/finance",
    label: "Finance center",
    label_ar: "المركز المالي",
    description: "Monitor GMV, commission, payables, and financial performance.",
  },
  {
    href: "/admin/payout-requests",
    label: "Payout requests",
    label_ar: "طلبات التحويل",
    description: "Review vendor and owner payout requests.",
  },
  {
    href: "/admin/finance-ledger",
    label: "Finance ledger",
    label_ar: "دفتر الأستاذ المالي",
    description: "Internal ledger for payments, commissions, and payables.",
  },
  {
    href: "/admin/settlements",
    label: "Settlement batches",
    label_ar: "دفعات التسوية",
    description: "Create and manage internal settlement batches.",
  },
  {
    href: "/admin/refunds",
    label: "Refunds & adjustments",
    label_ar: "المرتجع والتسويات",
    description: "Create internal refunds and finance adjustments.",
  },
  {
    href: "/admin/acceleration",
    label: "Acceleration finance",
    label_ar: "مالية التسريع",
    description: "Manage paid visibility boost packages and orders.",
  },
  {
    href: "/admin/finance-audit",
    label: "Finance audit log",
    label_ar: "سجل التدقيق المالي",
    description: "Review finance actions and audit trail.",
  },
];

export const ownerDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/portal/studio",
    label: "Owner overview",
    label_ar: "نظرة عامة على المالك",
    description: "Main studio owner dashboard.",
  },
  {
    href: "/portal/studio/bookings",
    label: "Studio bookings",
    label_ar: "حجوزات الاستوديو",
    description: "Accept, confirm, reject, or cancel studio bookings.",
  },
  {
    href: "/portal/studio/availability",
    label: "Studio availability",
    label_ar: "توافر الاستوديو",
    description: "Manage working hours and date exceptions.",
  },
  {
    href: "/portal/studio/payouts",
    label: "Finance",
    label_ar: "المالية",
    description: "Track studio revenue, commission, and net payable balance.",
  },
  {
    href: "/portal/studio/payout-requests",
    label: "Payout requests",
    label_ar: "طلبات التحويل",
    description: "Request payout from studio payable balance.",
  },
  {
    href: "/portal/studio/boost",
    label: "Acceleration",
    label_ar: "التسريع",
    description: "Request paid visibility boost for studios.",
  },
];

export const ownerPortalLinks: DashboardQuickLink[] = [
  {
    href: "/portal/studio",
    label: "Owner overview",
    label_ar: "نظرة عامة على المالك",
    description: "Main studio owner dashboard.",
  },
  {
    href: "/portal/studio/analytics",
    label: "Analytics",
    label_ar: "التحليلات",
    description: "Track revenue, bookings, and performance.",
  },
  {
    href: "/portal/studio/studios",
    label: "My studios",
    label_ar: "استوديوهاتي",
    description: "Manage your studio listings and details.",
  },
  {
    href: "/portal/studio/bookings",
    label: "Studio bookings",
    label_ar: "حجوزات الاستوديو",
    description: "Accept, confirm, reject, or cancel studio bookings.",
  },
  {
    href: "/portal/studio/availability",
    label: "Studio availability",
    label_ar: "توافر الاستوديو",
    description: "Manage working hours and date exceptions.",
  },
  {
    href: "/portal/studio/payouts",
    label: "Finance",
    label_ar: "المالية",
    description: "Track studio revenue, commission, and net payable balance.",
  },
  {
    href: "/portal/studio/payout-requests",
    label: "Payout requests",
    label_ar: "طلبات التحويل",
    description: "Request payout from studio payable balance.",
  },
  {
    href: "/portal/studio/bank",
    label: "Bank accounts",
    label_ar: "الحسابات البنكية",
    description: "Manage your bank accounts for payouts.",
  },
  {
    href: "/portal/studio/reviews",
    label: "Reviews",
    label_ar: "التقييمات",
    description: "View and manage customer reviews.",
  },
  {
    href: "/portal/studio/boost",
    label: "Acceleration",
    label_ar: "التسريع",
    description: "Request paid visibility boost for studios.",
  },
  {
    href: "/portal/studio/commission",
    label: "Commission",
    label_ar: "العمولة",
    description: "View current commission rates and fees.",
  },
  {
    href: "/portal/studio/onboarding",
    label: "Onboarding",
    label_ar: "الإعداد",
    description: "Complete your business verification profile.",
  },
];

export const vendorDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/portal/store",
    label: "Vendor overview",
    label_ar: "نظرة عامة على التاجر",
    description: "Main vendor dashboard.",
  },
  {
    href: "/portal/store/products",
    label: "Products",
    label_ar: "المنتجات",
    description: "Create and manage marketplace products.",
  },
  {
    href: "/portal/store/orders",
    label: "Orders",
    label_ar: "الطلبات",
    description: "Review marketplace sales orders.",
  },
  {
    href: "/portal/store/integrations",
    label: "Integrations",
    label_ar: "التكاملات",
    description: "Manage API keys and vendor integrations.",
  },
  {
    href: "/portal/store/payouts",
    label: "Finance",
    label_ar: "المالية",
    description: "Track sales, commission, and net payable balance.",
  },
  {
    href: "/portal/store/payout-requests",
    label: "Payout requests",
    label_ar: "طلبات التحويل",
    description: "Request payout from available balance.",
  },
  {
    href: "/portal/store/boost",
    label: "Acceleration",
    label_ar: "التسريع",
    description: "Request paid visibility boost.",
  },
];

export const vendorPortalLinks: DashboardQuickLink[] = [
  {
    href: "/portal/store",
    label: "Vendor overview",
    label_ar: "نظرة عامة على التاجر",
    description: "Main vendor dashboard.",
  },
  {
    href: "/portal/store/products",
    label: "Products",
    label_ar: "المنتجات",
    description: "Create and manage marketplace products.",
  },
  {
    href: "/portal/store/orders",
    label: "Orders",
    label_ar: "الطلبات",
    description: "Review marketplace sales orders.",
  },
  {
    href: "/portal/store/integrations",
    label: "Integrations",
    label_ar: "التكاملات",
    description: "Manage API keys and vendor integrations.",
  },
  {
    href: "/portal/store/payouts",
    label: "Finance",
    label_ar: "المالية",
    description: "Track sales, commission, and net payable balance.",
  },
  {
    href: "/portal/store/payout-requests",
    label: "Payout requests",
    label_ar: "طلبات التحويل",
    description: "Request payout from available balance.",
  },
  {
    href: "/portal/store/boost",
    label: "Acceleration",
    label_ar: "التسريع",
    description: "Request paid visibility boost.",
  },
];

export const customerDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/customer",
    label: "Customer overview",
    label_ar: "نظرة عامة على العميل",
    description: "Main customer dashboard.",
  },
  {
    href: "/customer/marketplace-orders",
    label: "Marketplace orders",
    label_ar: "طلبات السوق",
    description: "Review your marketplace purchases.",
  },
  {
    href: "/customer/payments",
    label: "Payments & receipts",
    label_ar: "المدفوعات والإيصالات",
    description: "View payment history and internal receipts.",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    label_ar: "المتجر",
    description: "Browse and buy audio gear.",
  },
  {
    href: "/studios",
    label: "Studios",
    label_ar: "الاستوديوهات",
    description: "Browse and book creative studios.",
  },
];
