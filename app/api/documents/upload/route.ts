import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDefaultBucketForScope,
  isAllowedDocumentType,
  isAllowedPrivateDocumentBucket,
  isAllowedVerificationScope,
  validateDocumentFile,
} from "@/lib/documents/validation";
import { createPrivateDocumentPath } from "@/lib/documents/storage";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const verificationScope = String(
      formData.get("verification_scope") || ""
    ).trim();
    const documentType = String(formData.get("document_type") || "").trim();
    const requestedBucket = String(formData.get("bucket") || "").trim();
    const verificationId = String(formData.get("verification_id") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file." },
        { status: 400 }
      );
    }

    if (!isAllowedVerificationScope(verificationScope)) {
      return NextResponse.json(
        { error: "Invalid verification scope." },
        { status: 400 }
      );
    }

    if (!isAllowedDocumentType(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type." },
        { status: 400 }
      );
    }

    const fileError = validateDocumentFile(file);

    if (fileError) {
      return NextResponse.json(
        { error: fileError },
        { status: 400 }
      );
    }

    const defaultBucket = getDefaultBucketForScope(verificationScope);
    const bucket =
      requestedBucket && isAllowedPrivateDocumentBucket(requestedBucket)
        ? requestedBucket
        : defaultBucket;

    const filePath = createPrivateDocumentPath({
      authUserId: user.id,
      verificationScope,
      documentType,
      originalFilename: file.name,
      mimeType: file.type,
    });

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const supabaseAdmin = createAdminClient();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: documentRow, error: documentInsertError } =
      await supabaseAdmin
        .from("verification_documents")
        .insert({
          auth_user_id: user.id,
          verification_id: verificationId || null,
          verification_scope: verificationScope,
          document_type: documentType,
          file_bucket: bucket,
          file_path: filePath,
          original_filename: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          status: "pending",
        })
        .select("id, file_bucket, file_path, status")
        .single();

    if (documentInsertError) {
      await supabaseAdmin.storage.from(bucket).remove([filePath]);
      throw new Error(documentInsertError.message);
    }

    return NextResponse.json({
      ok: true,
      document: documentRow,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return NextResponse.json(
      { error: "Could not upload document." },
      { status: 500 }
    );
  }
}
