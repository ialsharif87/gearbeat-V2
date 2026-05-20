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

export function normalizeSubdomainHost(hostname: string | null | undefined) {
  const firstHost = String(hostname || "")
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (firstHost.startsWith("[") && firstHost.includes("]")) {
    return firstHost.slice(1, firstHost.indexOf("]"));
  }

  if (firstHost === "::1") {
    return firstHost;
  }

  return firstHost.split(":")[0];
}

function isLocalHost(hostname: string) {
  const host = normalizeSubdomainHost(hostname);

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost")
  );
}

export function getSubdomainRootRedirectPath(options: {
  forwardedHostHeader?: string | null;
  hostHeader?: string | null;
  nextUrlHostname?: string | null;
  pathname: string;
}) {
  const {
    forwardedHostHeader,
    hostHeader,
    nextUrlHostname,
    pathname,
  } = options;

  if (pathname !== "/") {
    return null;
  }

  const hostCandidates = [
    forwardedHostHeader,
    hostHeader,
    nextUrlHostname,
  ];

  for (const candidate of hostCandidates) {
    const host = normalizeSubdomainHost(candidate);

    if (!host || isLocalHost(host)) {
      continue;
    }

    const redirectPath = SUBDOMAIN_ROOT_ROUTE_MAP[host];
    if (redirectPath) {
      return redirectPath;
    }
  }

  return null;
}

