export type VerificationScope =
  | "customer_identity"
  | "vendor_business"
  | "owner_business"
  | "studio"
  | "product"
  | "other";

export type DocumentType =
  | "national_id"
  | "passport"
  | "residence_id"
  | "driving_license"
  | "commercial_registration"
  | "tax_certificate"
  | "municipal_license"
  | "proof_of_address"
  | "studio_license"
  | "studio_photo"
  | "authorized_reseller_certificate"
  | "other";

export type PrivateDocumentBucket =
  | "identity-documents"
  | "business-documents"
  | "studio-documents"
  | "vendor-documents";

export type PublicMediaBucket =
  | "product-images"
  | "studio-images";

export type UploadDocumentInput = {
  verificationScope: VerificationScope;
  documentType: DocumentType;
  bucket: PrivateDocumentBucket;
  file: File;
};
