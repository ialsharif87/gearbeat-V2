import crypto from "crypto";

export function sanitizeFilename(filename: string) {
  const safeName = String(filename || "document")
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120);

  return safeName || "document";
}

export function getFileExtension(filename: string, mimeType: string) {
  const cleanName = sanitizeFilename(filename);
  const parts = cleanName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";

  if (extension) {
    return extension;
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "bin";
}

export function createPrivateDocumentPath({
  authUserId,
  verificationScope,
  documentType,
  originalFilename,
  mimeType,
}: {
  authUserId: string;
  verificationScope: string;
  documentType: string;
  originalFilename: string;
  mimeType: string;
}) {
  const extension = getFileExtension(originalFilename, mimeType);
  const randomId = crypto.randomUUID();

  return [
    authUserId,
    verificationScope,
    documentType,
    `${Date.now()}-${randomId}.${extension}`,
  ].join("/");
}
