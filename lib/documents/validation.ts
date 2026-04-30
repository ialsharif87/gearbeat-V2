import type {
  DocumentType,
  PrivateDocumentBucket,
  VerificationScope,
} from "@/lib/documents/types";

export const PRIVATE_DOCUMENT_BUCKETS: PrivateDocumentBucket[] = [
  "identity-documents",
  "business-documents",
  "studio-documents",
  "vendor-documents",
];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export function isAllowedPrivateDocumentBucket(
  value: string
): value is PrivateDocumentBucket {
  return PRIVATE_DOCUMENT_BUCKETS.includes(value as PrivateDocumentBucket);
}

export function isAllowedDocumentMimeType(value: string) {
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(value);
}

export function isAllowedVerificationScope(
  value: string
): value is VerificationScope {
  return [
    "customer_identity",
    "vendor_business",
    "owner_business",
    "studio",
    "product",
    "other",
  ].includes(value);
}

export function isAllowedDocumentType(value: string): value is DocumentType {
  return [
    "national_id",
    "passport",
    "residence_id",
    "driving_license",
    "commercial_registration",
    "tax_certificate",
    "municipal_license",
    "proof_of_address",
    "studio_license",
    "studio_photo",
    "authorized_reseller_certificate",
    "other",
  ].includes(value);
}

export function validateDocumentFile(file: File) {
  if (!file) {
    return "Missing file.";
  }

  if (!isAllowedDocumentMimeType(file.type)) {
    return "Unsupported file type. Allowed: PDF, JPG, PNG, WEBP.";
  }

  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "File is too large. Maximum size is 10MB.";
  }

  return null;
}

export function getDefaultBucketForScope(
  verificationScope: VerificationScope
): PrivateDocumentBucket {
  if (verificationScope === "customer_identity") {
    return "identity-documents";
  }

  if (verificationScope === "vendor_business") {
    return "vendor-documents";
  }

  if (verificationScope === "owner_business") {
    return "business-documents";
  }

  if (verificationScope === "studio") {
    return "studio-documents";
  }

  return "business-documents";
}
