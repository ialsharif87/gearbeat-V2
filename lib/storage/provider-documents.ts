import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "provider-documents";

/**
 * Normalizes a document reference into a storage path.
 * Supports legacy absolute public Supabase storage URLs and future relative storage paths.
 */
export function getDocumentStoragePath(documentRef: string | null | undefined): string | null {
  if (!documentRef) return null;

  // If it's already a relative path (doesn't start with http), return it
  if (!documentRef.startsWith("http")) {
    return documentRef;
  }

  // If it's a legacy public URL, try to extract the path
  // Expected format: https://[project].supabase.co/storage/v1/object/public/provider-documents/[path]
  try {
    const url = new URL(documentRef);
    const searchString = `/object/public/${BUCKET_NAME}/`;
    const index = url.pathname.indexOf(searchString);
    
    if (index !== -1) {
      return decodeURIComponent(url.pathname.substring(index + searchString.length));
    }
  } catch (e) {
    console.error("Error parsing provider document URL:", e);
  }

  // Fallback: If it starts with the bucket name but was passed as a path starting with it
  if (documentRef.startsWith(`${BUCKET_NAME}/`)) {
    return documentRef.substring(BUCKET_NAME.length + 1);
  }

  return null;
}

/**
 * Generates a short-lived signed URL for a provider document.
 * Returns null for invalid/unrecognized URLs.
 */
export async function getSignedDocumentUrl(documentRef: string | null | undefined, expiresIn: number = 3600) {
  if (!documentRef) return null;

  const path = getDocumentStoragePath(documentRef);
  if (!path) {
    return null;
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`Error generating signed URL for ${path}:`, error);
    return null;
  }

  return data.signedUrl;
}
