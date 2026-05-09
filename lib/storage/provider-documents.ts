"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "provider-documents";

/**
 * Securely uploads a provider document using the admin client.
 * Validates file type, size, and destination folder.
 */
export async function uploadProviderDocumentAction(
  formData: FormData,
  folder: string
) {
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // 1. Validate File Type
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Only PDF, PNG, and JPG are allowed." };
  }

  // 2. Validate File Size (Max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File too large. Maximum size is 10MB." };
  }

  // 3. Validate Folder
  const allowedFolders = ["studio-applications", "seller-applications", "contracts"];
  if (!allowedFolders.includes(folder)) {
    return { success: false, error: "Invalid destination folder." };
  }

  const supabaseAdmin = createAdminClient();
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error details:", uploadError);
    return { success: false, error: uploadError.message };
  }

  return { success: true, path: filePath };
}



/**
 * Normalizes a document reference into a storage path.
 * Supports legacy absolute public Supabase storage URLs and future relative storage paths.
 */
export async function getDocumentStoragePath(documentRef: string | null | undefined): Promise<string | null> {
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

  const path = await getDocumentStoragePath(documentRef);
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

export async function getSignedDocumentUrlAction(documentRef: string | null | undefined, appId: string) {
  try {
    if (!documentRef || !appId) {
      return { success: false, error: "Missing parameters", url: null };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized", url: null };
    }

    const requestedPath = await getDocumentStoragePath(documentRef);
    if (!requestedPath) {
      return { success: false, error: "Invalid document reference", url: null };
    }

    // 1. Verify ownership in studio_applications
    const { data: studioApp } = await supabase
      .from("studio_applications")
      .select("contract_url, email, linked_user_id, cr_document_url, vat_certificate_url, national_address_url, bank_document_url")
      .eq("id", appId)
      .maybeSingle();

    let authorized = false;

    if (studioApp) {
      const docFields = [
        studioApp.contract_url,
        studioApp.cr_document_url,
        studioApp.vat_certificate_url,
        studioApp.national_address_url,
        studioApp.bank_document_url
      ];

      for (const field of docFields) {
        if (field) {
          const storedPath = await getDocumentStoragePath(field);
          if (storedPath === requestedPath && (studioApp.email === user.email || studioApp.linked_user_id === user.id)) {
            authorized = true;
            break;
          }
        }
      }
    }

    // 2. Fallback: Verify ownership in provider_leads (Onboarding/Seller flow)
    if (!authorized) {
      const { data: lead } = await supabase
        .from("provider_leads")
        .select("signed_contract_url, vat_document_url")
        .eq("email", user.email)
        .maybeSingle();
      
      if (lead) {
        const leadDocs = [lead.signed_contract_url, lead.vat_document_url];
        for (const field of leadDocs) {
          if (field) {
            const leadPath = await getDocumentStoragePath(field);
            if (leadPath === requestedPath) {
              authorized = true;
              break;
            }
          }
        }
      }
    }

    if (!authorized) {
      return { success: false, error: "Forbidden: Access denied", url: null };
    }

    const url = await getSignedDocumentUrl(requestedPath);
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message, url: null };
  }
}


