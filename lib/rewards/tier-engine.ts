/**
 * GearBeat Tier & Rewards Engine
 * Logic for calculating Studio and Customer Tiers based on marketplace activity.
 */

export type StudioTierLevel = 1 | 2 | 3 | 4 | 5;
export type CustomerTierLevel = 1 | 2 | 3 | 4 | 5;

export interface StudioTierCriteria {
  isApproved: boolean;
  isPublished: boolean;
  isProfileComplete: boolean;
  completedBookings: number;
  averageRating: number;
  cancellationRate: number; // 0 to 1
  responseTimeMinutes: number;
  isAdminSelected: boolean;
}

export interface CustomerTierCriteria {
  completedBookings: number;
  totalSpend: number;
  isInvited: boolean;
}

/**
 * Determine Studio Tier based on performance criteria
 */
export function calculateStudioTier(criteria: StudioTierCriteria): StudioTierLevel {
  const { 
    isApproved, 
    isPublished, 
    isProfileComplete, 
    completedBookings, 
    averageRating, 
    cancellationRate,
    isAdminSelected 
  } = criteria;

  // Tier 5: GearBeat Flagship (Admin Selection)
  if (isAdminSelected) return 5;

  // Tier 4: Elite Studio
  if (
    isApproved && 
    isPublished && 
    completedBookings >= 50 && 
    averageRating >= 4.7
  ) return 4;

  // Tier 3: Premium Studio
  if (
    isApproved && 
    isPublished && 
    completedBookings >= 25 && 
    averageRating >= 4.5 && 
    cancellationRate <= 0.1
  ) return 3;

  // Tier 2: Trusted Studio
  if (
    isApproved && 
    isPublished && 
    completedBookings >= 10 && 
    averageRating >= 4.3
  ) return 2;

  // Tier 1: Verified Studio (Basic requirement)
  if (isApproved && isPublished && isProfileComplete) return 1;

  // Default / No Tier
  return 1; 
}

/**
 * Determine Customer Tier based on activity
 */
export function calculateCustomerTier(criteria: CustomerTierCriteria): CustomerTierLevel {
  const { completedBookings, totalSpend, isInvited } = criteria;

  // Tier 5: GearBeat Insider
  if (isInvited || (completedBookings >= 25 && totalSpend >= 10000)) return 5;

  // Tier 4: Pro Creator
  if (completedBookings >= 15 || totalSpend >= 5000) return 4;

  // Tier 3: Studio Regular
  if (completedBookings >= 7) return 3;

  // Tier 2: Beat Seeker
  if (completedBookings >= 3) return 2;

  // Tier 1: First Beat
  if (completedBookings >= 1) return 1;

  return 1;
}

/**
 * Localized Tier Names
 */
export const STUDIO_TIER_NAMES = {
  1: { en: "Verified Studio", ar: "استوديو موثّق" },
  2: { en: "Trusted Studio", ar: "استوديو موثوق" },
  3: { en: "Premium Studio", ar: "استوديو مميز" },
  4: { en: "Elite Studio", ar: "استوديو نخبة" },
  5: { en: "GearBeat Flagship Studio", ar: "استوديو رئيسي معتمد" },
};

export const CUSTOMER_TIER_NAMES = {
  1: { en: "First Beat", ar: "أول نبضة" },
  2: { en: "Beat Seeker", ar: "باحث عن الإيقاع" },
  3: { en: "Studio Regular", ar: "زائر الاستوديوهات" },
  4: { en: "Pro Creator", ar: "مبدع محترف" },
  5: { en: "GearBeat Insider", ar: "عضو GearBeat الخاص" },
};
