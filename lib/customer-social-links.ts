export const CUSTOMER_SOCIAL_LINK_PLATFORMS = [
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "linkedin",
  "facebook",
  "website",
] as const;

export type CustomerSocialLinkPlatform =
  (typeof CUSTOMER_SOCIAL_LINK_PLATFORMS)[number];

export type CustomerSocialLinkInput = {
  platform: CustomerSocialLinkPlatform;
  url: string;
  handle: string | null;
};

export type CustomerSocialLinkRow = CustomerSocialLinkInput & {
  id: string;
  visibility: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
};

type ValidationResult =
  | { ok: true; links: CustomerSocialLinkInput[] }
  | { ok: false; error: string };

const PLATFORM_SET = new Set<string>(CUSTOMER_SOCIAL_LINK_PLATFORMS);
const MAX_URL_LENGTH = 300;
const MAX_HANDLE_LENGTH = 80;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isCustomerSocialLinkPlatform(
  value: string
): value is CustomerSocialLinkPlatform {
  return PLATFORM_SET.has(value);
}

function isHttpUrl(value: string) {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeCustomerSocialLinkRow(
  row: Record<string, unknown>
): CustomerSocialLinkRow {
  return {
    id: cleanText(row.id),
    platform: cleanText(row.platform) as CustomerSocialLinkPlatform,
    url: cleanText(row.url),
    handle: cleanText(row.handle) || null,
    visibility: cleanText(row.visibility) || "public",
    moderationStatus: cleanText(row.moderation_status) || "approved",
    createdAt: cleanText(row.created_at),
    updatedAt: cleanText(row.updated_at),
  };
}

export function validateCustomerSocialLinksPayload(
  body: unknown
): ValidationResult {
  if (!body || typeof body !== "object" || !("links" in body)) {
    return { ok: false, error: "Expected a links array." };
  }

  const links = (body as { links?: unknown }).links;

  if (!Array.isArray(links)) {
    return { ok: false, error: "Expected a links array." };
  }

  if (links.length > CUSTOMER_SOCIAL_LINK_PLATFORMS.length) {
    return { ok: false, error: "Too many social links." };
  }

  const seenPlatforms = new Set<CustomerSocialLinkPlatform>();
  const normalizedLinks: CustomerSocialLinkInput[] = [];

  for (const item of links) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Invalid social link item." };
    }

    const rawItem = item as Record<string, unknown>;
    const platform = cleanText(rawItem.platform).toLowerCase();
    const url = cleanText(rawItem.url);
    const handle = cleanText(rawItem.handle) || null;

    if (!isCustomerSocialLinkPlatform(platform)) {
      return { ok: false, error: "Invalid social link platform." };
    }

    if (seenPlatforms.has(platform)) {
      return { ok: false, error: "Duplicate social link platform." };
    }

    if (!url) {
      return { ok: false, error: "Social link URL is required." };
    }

    if (url.length > MAX_URL_LENGTH) {
      return { ok: false, error: "Social link URL is too long." };
    }

    if (!isHttpUrl(url)) {
      return {
        ok: false,
        error: "Social link URL must start with http:// or https://.",
      };
    }

    if (handle && handle.length > MAX_HANDLE_LENGTH) {
      return { ok: false, error: "Social link handle is too long." };
    }

    seenPlatforms.add(platform);
    normalizedLinks.push({
      platform,
      url,
      handle,
    });
  }

  return { ok: true, links: normalizedLinks };
}
