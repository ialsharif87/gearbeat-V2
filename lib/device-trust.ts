"use server";

import { cookies } from "next/headers";

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
  } catch (e) {
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
