/**
 * GearBeat Loyalty & Rewards Logic
 * Patch 35 & 35A
 */

export type TierCode = "listener" | "creator" | "producer" | "maestro" | "legend";

export interface LoyaltyTier {
  code: TierCode;
  name_en: string;
  name_ar: string;
  min_points: number; // Points needed to reach this tier (lifetime)
  min_lifetime_spend?: number;
  earn_multiplier: number;
  redemption_cap_percent?: number;
  sort_order: number;
  benefits_en: string[];
  benefits_ar: string[];
  fee_discount_percentage?: number;
}

export const LOYALTY_TIERS: Record<TierCode, LoyaltyTier> = {
  listener: {
    code: "listener",
    name_en: "Listener",
    name_ar: "مستمع",
    min_points: 0,
    earn_multiplier: 1.0,
    sort_order: 10,
    benefits_en: ["Standard booking rates", "Community access", "Reward points on every booking"],
    benefits_ar: ["أسعار الحجز القياسية", "وصول للمجتمع", "نقاط مكافأة على كل حجز"],
  },
  creator: {
    code: "creator",
    name_en: "Creator",
    name_ar: "مبدع",
    min_points: 1000,
    earn_multiplier: 1.1,
    sort_order: 20,
    benefits_en: [
      "1.1x Points multiplier",
      "Exclusive creator offers",
      "Birthday bonus points",
    ],
    benefits_ar: [
      "مضاعف نقاط 1.1x",
      "عروض حصرية للمبدعين",
      "نقاط إضافية في يوم الميلاد",
    ],
  },
  producer: {
    code: "producer",
    name_en: "Producer",
    name_ar: "منتج",
    min_points: 5000,
    earn_multiplier: 1.25,
    sort_order: 30,
    benefits_en: [
      "1.25x Points multiplier",
      "Priority studio confirmation",
      "Invitation to GearBeat events",
      "Quarterly bonus rewards",
    ],
    benefits_ar: [
      "مضاعف نقاط 1.25x",
      "أولوية تأكيد الاستوديو",
      "دعوة لفعاليات GearBeat",
      "مكافآت ربع سنوية إضافية",
    ],
  },
  maestro: {
    code: "maestro",
    name_en: "Maestro",
    name_ar: "مايسترو",
    min_points: 15000,
    earn_multiplier: 1.5,
    sort_order: 40,
    fee_discount_percentage: 5,
    benefits_en: [
      "1.5x Points multiplier",
      "5% Discount on service fees",
      "VIP Support line",
      "Early access to new studios",
    ],
    benefits_ar: [
      "مضاعف نقاط 1.5x",
      "خصم 5% على رسوم الخدمة",
      "خط دعم كبار الشخصيات",
      "وصول مبكر للاستوديوهات الجديدة",
    ],
  },
  legend: {
    code: "legend",
    name_en: "Legend",
    name_ar: "أسطورة",
    min_points: 50000,
    earn_multiplier: 2.0,
    sort_order: 50,
    fee_discount_percentage: 10,
    benefits_en: [
      "2.0x Points multiplier",
      "10% Discount on service fees",
      "Personalized gear concierge",
      "Lifetime membership badge",
      "Complimentary GearBeat merch",
    ],
    benefits_ar: [
      "مضاعف نقاط 2.0x",
      "خصم 10% على رسوم الخدمة",
      "خدمة كونسيرج شخصية للمعدات",
      "شارة عضوية مدى الحياة",
      "منتجات GearBeat مجانية",
    ],
  },
};

/**
 * Calculate points earned for a given spend amount and current tier
 */
export function calculatePoints(amount: number, tierCode: TierCode = "listener"): number {
  const tier = LOYALTY_TIERS[tierCode] || LOYALTY_TIERS.listener;
  return Math.floor(amount * tier.earn_multiplier);
}

/**
 * Get information about the next tier progression
 */
export function getNextTierInfo(currentPoints: number) {
  const tiers = Object.values(LOYALTY_TIERS).sort((a, b) => a.sort_order - b.sort_order);
  
  let currentTier = tiers[0];
  let nextTier = null;

  for (let i = 0; i < tiers.length; i++) {
    if (currentPoints >= tiers[i].min_points) {
      currentTier = tiers[i];
    } else {
      nextTier = tiers[i];
      break;
    }
  }

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      pointsNeeded: 0,
      progress: 100,
    };
  }

  const pointsNeeded = nextTier.min_points - currentPoints;
  const range = nextTier.min_points - currentTier.min_points;
  const progress = Math.min(100, Math.max(0, ((currentPoints - currentTier.min_points) / range) * 100));

  return {
    currentTier,
    nextTier,
    pointsNeeded,
    progress,
  };
}

/**
 * Get localized benefits for a tier
 */
export function getTierBenefits(tierCode: TierCode, lang: "en" | "ar" = "en") {
  const tier = LOYALTY_TIERS[tierCode] || LOYALTY_TIERS.listener;
  return lang === "ar" ? tier.benefits_ar : tier.benefits_en;
}
