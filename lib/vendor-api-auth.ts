import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type VendorApiAuthResult =
  | {
      ok: true;
      apiKeyId: string;
      authUserId: string;
      vendorId: string;
      permissions: string[];
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export function hashVendorApiKey(rawKey: string) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function getApiKeyPrefix(rawKey: string) {
  return rawKey.slice(0, 14);
}

export function generateVendorApiKey() {
  const randomPart = crypto.randomBytes(32).toString("hex");
  return `gb_vendor_${randomPart}`;
}

export function hasVendorPermission(
  permissions: string[],
  requiredPermission: string
) {
  return permissions.includes(requiredPermission) || permissions.includes("*");
}

export async function authenticateVendorApiRequest(
  request: Request,
  requiredPermission: string
): Promise<VendorApiAuthResult> {
  const rawHeader =
    request.headers.get("x-gearbeat-api-key") ||
    request.headers.get("authorization") ||
    "";

  const rawKey = rawHeader.startsWith("Bearer ")
    ? rawHeader.replace("Bearer ", "").trim()
    : rawHeader.trim();

  if (!rawKey) {
    return {
      ok: false,
      status: 401,
      error: "Missing API key.",
    };
  }

  const keyHash = hashVendorApiKey(rawKey);
  const supabaseAdmin = createAdminClient();

  const { data: apiKey, error } = await supabaseAdmin
    .from("vendor_api_keys")
    .select(`
      id,
      auth_user_id,
      vendor_id,
      key_hash,
      permissions,
      status
    `)
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      status: 500,
      error: error.message,
    };
  }

  if (!apiKey || apiKey.status !== "active") {
    return {
      ok: false,
      status: 401,
      error: "Invalid or inactive API key.",
    };
  }

  const permissions = Array.isArray(apiKey.permissions)
    ? apiKey.permissions
    : [];

  if (!hasVendorPermission(permissions, requiredPermission)) {
    return {
      ok: false,
      status: 403,
      error: `Missing permission: ${requiredPermission}`,
    };
  }

  await supabaseAdmin
    .from("vendor_api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", apiKey.id);

  return {
    ok: true,
    apiKeyId: apiKey.id,
    authUserId: apiKey.auth_user_id,
    vendorId: apiKey.vendor_id || apiKey.auth_user_id,
    permissions,
  };
}

export async function logVendorApiRequest({
  apiKeyId,
  authUserId,
  vendorId,
  endpoint,
  method,
  statusCode,
  requestSummary,
  responseSummary,
}: {
  apiKeyId?: string | null;
  authUserId?: string | null;
  vendorId?: string | null;
  endpoint: string;
  method: string;
  statusCode: number;
  requestSummary?: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
}) {
  try {
    const supabaseAdmin = createAdminClient();

    await supabaseAdmin.from("vendor_api_request_logs").insert({
      api_key_id: apiKeyId || null,
      auth_user_id: authUserId || null,
      vendor_id: vendorId || null,
      endpoint,
      method,
      status_code: statusCode,
      request_summary: requestSummary || {},
      response_summary: responseSummary || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Vendor API request log failed:", error);
  }
}
