export const TAP_CONFIG = {
  secretKey: process.env.TAP_SECRET_KEY || "",
  publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY || "",
  baseUrl: "https://api.tap.company/v2",
  currency: "SAR",
  country: "SA",
  language: "ar",
};

export const isTapConfigured = () =>
  !!process.env.TAP_SECRET_KEY && !!process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY;
