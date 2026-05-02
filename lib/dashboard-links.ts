import type { DashboardQuickLink } from "../components/dashboard-quick-links";

export const adminDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/admin",
    label: "Admin overview",
    description: "Main admin dashboard.",
  },
  {
    href: "/admin/products",
    label: "Product review",
    description: "Review and manage marketplace products.",
  },
  {
    href: "/admin/catalog",
    label: "Catalog settings",
    description: "Manage categories, brands, and catalog data.",
  },
  {
    href: "/admin/marketplace-orders",
    label: "Marketplace orders",
    description: "Monitor customer marketplace orders.",
  },
  {
    href: "/admin/commission-settings",
    label: "Commission settings",
    description: "Set GearBeat commission from 10% to 30%.",
  },
  {
    href: "/admin/payouts",
    label: "Payouts & settlements",
    description: "Review commission and net payable reports.",
  },
  {
    href: "/admin/system-health",
    label: "System health",
    description: "Check core tables and production readiness.",
  },
  {
    href: "/admin/finance",
    label: "Finance center",
    description: "Monitor GMV, commission, payables, and financial performance.",
  },
];

export const ownerDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/owner",
    label: "Owner overview",
    description: "Main studio owner dashboard.",
  },
  {
    href: "/owner/bookings",
    label: "Studio bookings",
    description: "Accept, confirm, reject, or cancel studio bookings.",
  },
  {
    href: "/owner/availability",
    label: "Studio availability",
    description: "Manage working hours and date exceptions.",
  },
  {
    href: "/owner/finance",
    label: "Finance",
    description: "Track studio revenue, commission, and net payable balance.",
  },
];

export const vendorDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/vendor",
    label: "Vendor overview",
    description: "Main vendor dashboard.",
  },
  {
    href: "/vendor/products",
    label: "Products",
    description: "Create and manage marketplace products.",
  },
  {
    href: "/vendor/orders",
    label: "Orders",
    description: "Review marketplace sales orders.",
  },
  {
    href: "/vendor/integrations",
    label: "Integrations",
    description: "Manage API keys and vendor integrations.",
  },
  {
    href: "/vendor/finance",
    label: "Finance",
    description: "Track sales, commission, and net payable balance.",
  },
];

export const customerDashboardLinks: DashboardQuickLink[] = [
  {
    href: "/customer",
    label: "Customer overview",
    description: "Main customer dashboard.",
  },
  {
    href: "/customer/marketplace-orders",
    label: "Marketplace orders",
    description: "Review your marketplace purchases.",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Browse and buy audio gear.",
  },
  {
    href: "/studios",
    label: "Studios",
    description: "Browse and book creative studios.",
  },
];
