import { createAdminClient } from "@/lib/supabase/admin";

const CONTRACT_BUCKET = "provider-documents";

/**
 * Normalizes a contract reference into a storage path.
 * Supports legacy full public URLs and new relative storage paths.
 */
export function getContractStoragePath(contractRef: string | null | undefined): string | null {
  if (!contractRef) return null;

  // If it's already a relative path (doesn't start with http), return it
  if (!contractRef.startsWith("http")) {
    return contractRef;
  }

  // If it's a legacy public URL, try to extract the path
  // Format: https://[project].supabase.co/storage/v1/object/public/provider-documents/[path]
  try {
    const url = new URL(contractRef);
    const searchString = `/object/public/${CONTRACT_BUCKET}/`;
    const index = url.pathname.indexOf(searchString);
    
    if (index !== -1) {
      return decodeURIComponent(url.pathname.substring(index + searchString.length));
    }
  } catch (e) {
    console.error("Error parsing contract URL:", e);
  }

  return null;
}

/**
 * Generates a short-lived signed URL for a signed contract.
 */
export async function getSignedContractUrl(contractRef: string | null | undefined, expiresIn: number = 900) {
  if (!contractRef) return null;

  const path = getContractStoragePath(contractRef);
  if (!path) {
    return null;
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from(CONTRACT_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Error generating signed contract URL:", error);
    return null;
  }

  return data.signedUrl;
}
