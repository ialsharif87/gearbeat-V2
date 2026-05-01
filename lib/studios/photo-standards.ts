export const STUDIO_MIN_PHOTOS = 6;
export const STUDIO_MAX_PHOTOS = 20;

export const STUDIO_REQUIRED_PHOTO_CATEGORIES = [
  "cover",
  "control_room",
  "recording_room",
  "equipment",
  "entrance",
  "wide_angle",
] as const;

export const STUDIO_OPTIONAL_PHOTO_CATEGORIES = [
  "lounge",
  "booth",
  "instruments",
  "parking",
  "bathroom",
  "building",
  "other",
] as const;

export type StudioRequiredPhotoCategory =
  (typeof STUDIO_REQUIRED_PHOTO_CATEGORIES)[number];

export type StudioOptionalPhotoCategory =
  (typeof STUDIO_OPTIONAL_PHOTO_CATEGORIES)[number];

export type StudioPhotoCategory =
  | StudioRequiredPhotoCategory
  | StudioOptionalPhotoCategory;

export type StudioPhotoLike = {
  id?: string;
  image_url?: string | null;
  url?: string | null;
  category?: string | null;
  is_cover?: boolean | null;
};

export function getStudioPhotoCategoryLabel(category: string) {
  const labels: Record<string, { en: string; ar: string }> = {
    cover: {
      en: "Cover photo",
      ar: "الصورة الرئيسية",
    },
    control_room: {
      en: "Control room",
      ar: "غرفة التحكم",
    },
    recording_room: {
      en: "Recording room",
      ar: "غرفة التسجيل",
    },
    equipment: {
      en: "Equipment",
      ar: "المعدات",
    },
    entrance: {
      en: "Entrance / building",
      ar: "المدخل / المبنى",
    },
    wide_angle: {
      en: "Wide-angle room photo",
      ar: "صورة واسعة للمكان",
    },
    lounge: {
      en: "Lounge",
      ar: "منطقة الانتظار",
    },
    booth: {
      en: "Booth",
      ar: "الكابينة",
    },
    instruments: {
      en: "Instruments",
      ar: "الآلات",
    },
    parking: {
      en: "Parking",
      ar: "المواقف",
    },
    bathroom: {
      en: "Bathroom",
      ar: "دورة المياه",
    },
    building: {
      en: "Building",
      ar: "المبنى",
    },
    other: {
      en: "Other",
      ar: "أخرى",
    },
  };

  return labels[category] || labels.other;
}

export function analyzeStudioPhotoCompletion(images: StudioPhotoLike[]) {
  const cleanImages = images.filter(
    (image) => image.image_url || image.url
  );

  const categories = new Set(
    cleanImages
      .map((image) => image.category)
      .filter(Boolean)
      .map(String)
  );

  const hasCover = cleanImages.some(
    (image) => image.is_cover || image.category === "cover"
  );

  const missingRequiredCategories = STUDIO_REQUIRED_PHOTO_CATEGORIES.filter(
    (category) => {
      if (category === "cover") {
        return !hasCover;
      }

      return !categories.has(category);
    }
  );

  const photoCount = cleanImages.length;

  const isComplete =
    photoCount >= STUDIO_MIN_PHOTOS &&
    photoCount <= STUDIO_MAX_PHOTOS &&
    missingRequiredCategories.length === 0;

  return {
    photoCount,
    minPhotos: STUDIO_MIN_PHOTOS,
    maxPhotos: STUDIO_MAX_PHOTOS,
    hasCover,
    missingRequiredCategories,
    isComplete,
  };
}
