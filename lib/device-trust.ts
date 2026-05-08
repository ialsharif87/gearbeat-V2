"use server";

import "server-only";
import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const TRUSTED_DEVICE_COOKIE = "gb_trusted_device";

/**
 * Checks if a cookie value is in the legacy userId:expiry format.
 */
function isLegacyTrustedDeviceCookie(value: string): boolean {
  return value.includes(":") && value.split(":").length === 2;
}

/**
 * Validates a legacy trusted device cookie.
 */
function validateLegacyTrustedDeviceCookie(value: string, userId: string): boolean {
  try {
    const [storedUserId, expiry] = value.split(":");
    if (storedUserId !== userId) return false;
    if (Date.now() > parseInt(expiry)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses basic browser and OS information from User-Agent string.
 */
function parseUserAgent(ua: string) {
  const browser = /chrome|firefox|safari|edge|opera|msie|trident/i.exec(ua)?.[0] || "Unknown Browser";
  const os = /windows|macintosh|linux|android|ios|iphone|ipad/i.exec(ua)?.[0] || "Unknown OS";
  return { browser, os };
}

/**
 * Collects device metadata from request headers.
 */
async function getTrustedDeviceMetadata(): Promise<DeviceMetadata> {
  const headerList = await headers();
  const ua = headerList.get("user-agent") || "";
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "Unknown IP";
  const { browser, os } = parseUserAgent(ua);
  
  return {
    device_name: `${browser} on ${os}`,
    browser,
    os,
    last_ip: ip
  };
}

/**
 * Checks if the current device is trusted for the given user.
 * Supports both new database-backed secure tokens and legacy plaintext cookies.
 */
export async function isDeviceTrusted(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;

  if (!token) return false;

  // 1. Check if it's a legacy cookie format
  if (isLegacyTrustedDeviceCookie(token)) {
    return validateLegacyTrustedDeviceCookie(token, userId);
  }

  // 2. Otherwise treat as a secure token and verify against database
  return await verifyTrustedDeviceToken(userId, token);
}

/**
 * Marks the current device as trusted for the next 30 days.
 * Uses secure database-backed tokens with a fallback to legacy format on DB failure.
 */
export async function trustDevice(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await generateTrustedDeviceToken();
  const metadata = await getTrustedDeviceMetadata();

  // 1. Try to register the token in the database
  const recordId = await registerTrustedDeviceToken(userId, token, metadata);

  let finalToken = token;

  if (!recordId) {
    // FALLBACK: If database registration fails, use the legacy format to avoid breaking login
    const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
    finalToken = `${userId}:${expiryTime}`;
    console.warn("Trusted device database registration failed. Falling back to legacy cookie format.");
  }

  // 2. Set the cookie (either secure token or legacy fallback)
  cookieStore.set(TRUSTED_DEVICE_COOKIE, finalToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  });
}

/**
 * NEW UTILITIES (PATCH 17)
 */

export async function generateTrustedDeviceToken(): Promise<string> {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashTrustedDeviceToken(token: string): Promise<string> {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function verifyTrustedDeviceToken(userId: string, token: string): Promise<boolean> {
  if (!token) return false;
  
  const tokenHash = await hashTrustedDeviceToken(token);
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from("trusted_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data) return false;

    // Update last_used_at asynchronously
    supabase
      .from("trusted_devices")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id)
      .then(() => {});

    return true;
  } catch (err) {
    console.error("Error verifying trusted device token:", err);
    return false;
  }
}

interface DeviceMetadata {
  device_name?: string;
  browser?: string;
  os?: string;
  last_ip?: string;
  expires_at?: string;
}

export async function registerTrustedDeviceToken(
  userId: string, 
  token: string, 
  metadata: DeviceMetadata = {}
): Promise<string | null> {
  if (!token) return null;
  
  const tokenHash = await hashTrustedDeviceToken(token);
  const supabase = createAdminClient();
  
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 30);

  try {
    const { data, error } = await supabase
      .from("trusted_devices")
      .insert({
        user_id: userId,
        device_token_hash: tokenHash,
        device_name: metadata.device_name || "Unknown Device",
        browser: metadata.browser,
        os: metadata.os,
        last_ip: metadata.last_ip,
        expires_at: metadata.expires_at || defaultExpiry.toISOString(),
        last_used_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error("Error registering trusted device token:", err);
    return null;
  }
}

export async function revokeTrustedDeviceByToken(userId: string, token: string): Promise<boolean> {
  if (!token) return false;
  
  const tokenHash = await hashTrustedDeviceToken(token);
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from("trusted_devices")
      .delete()
      .eq("user_id", userId)
      .eq("device_token_hash", tokenHash);

    return !error;
  } catch (err) {
    console.error("Error revoking trusted device token:", err);
    return false;
  }
}

export async function cleanupExpiredTrustedDevices(): Promise<boolean> {
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase
      .from("trusted_devices")
      .delete()
      .lt("expires_at", new Date().toISOString());

    return !error;
  } catch (err) {
    console.error("Error cleaning up expired trusted devices:", err);
    return false;
  }
}


