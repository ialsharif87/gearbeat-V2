/**
 * GearBeat Analytics Utility
 * Provides a safe wrapper for GA4 events.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// log the pageview with their URL
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// log specific events happening.
export const event = ({ action, params }: { action: string; params: any }) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};
