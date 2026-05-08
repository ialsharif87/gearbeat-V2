"use server";

import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const TRUSTED_DEVICE_COOKIE = "gb_trusted_device";

/**
 * Checks if the current device is trusted for the given user.
 * In a real-world scenario, this might involve a database check.
 * For this task, we'll use a simple httpOnly cookie that stores a token.
 */
export async function isDeviceTrusted(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;

  if (!token) return false;

  // The token should ideally be signed and include the userId.
  // For simplicity and adherence to the request, we check if it exists.
  // In a robust implementation, we'd verify the signature and userId.
  try {
    const [storedUserId, expiry] = token.split(":");
    if (storedUserId !== userId) return false;
    if (Date.now() > parseInt(expiry)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Marks the current device as trusted for the next 30 days.
 */
export async function trustDevice(userId: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Create a token: userId:expiryTime
  // Note: This is a simple implementation. A signed JWT would be better.
  const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const token = `${userId}:${expiryTime}`;

  cookieStore.set(TRUSTED_DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  });
}

/**
 * NEW UTILITIES (PATCH 17)
 * These will be used in future patches to replace the legacy cookie-only logic.
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

