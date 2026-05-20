/**
 * Patch 127A foundation:
 * Centralized subdomain access boundary map for GearBeat web routing.
 */

export const GEARBEAT_PUBLIC_DOMAIN = "gearbeat.app";

// Internal admin only.
export const GEARBEAT_ADMIN_DOMAIN = "admin.gearbeat.app";

// Partner application intake only.
export const GEARBEAT_PARTNERS_DOMAIN = "partners.gearbeat.app";

// Approved studio owner portal only.
export const GEARBEAT_STUDIO_PORTAL_DOMAIN = "portal.gearbeat.app";

// Approved seller portal only.
export const GEARBEAT_SELLER_PORTAL_DOMAIN = "seller.gearbeat.app";

export const SUBDOMAIN_ROOT_ROUTE_MAP: Record<string, string> = {
  [GEARBEAT_ADMIN_DOMAIN]: "/admin",
  [GEARBEAT_PARTNERS_DOMAIN]: "/partners/apply",
  [GEARBEAT_STUDIO_PORTAL_DOMAIN]: "/portal/studio",
  [GEARBEAT_SELLER_PORTAL_DOMAIN]: "/portal/store",
};

function normalizeHost(hostname: string) {
  return String(hostname || "").toLowerCase().split(":")[0];
}

function isLocalHost(hostname: string) {
  const host = normalizeHost(hostname);

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost")
  );
}

export function getSubdomainRootRewritePath(hostname: string, pathname: string) {
  if (pathname !== "/") {
    return null;
  }

  if (isLocalHost(hostname)) {
    return null;
  }

  const host = normalizeHost(hostname);
  return SUBDOMAIN_ROOT_ROUTE_MAP[host] || null;
}

