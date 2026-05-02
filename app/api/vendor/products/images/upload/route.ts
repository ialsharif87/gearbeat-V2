import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function safeFileName(value: string) {
  const cleanValue = value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleanValue || "product-image";
}

function getFileExtension(file: File) {
  const name = file.name || "";
  const extension = name.split(".").pop();

  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  return "jpg";
}

function getSafeImageArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

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

    const productId = cleanText(formData.get("product_id"));
    const file = formData.get("file");

    if (!productId) {
      return NextResponse.json(
        { error: "Product id is required." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid image type. Allowed types: JPG, PNG, WEBP, and GIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size cannot exceed 10MB." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || !["vendor", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Vendor access required." },
        { status: 403 }
      );
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const vendorIdCandidates = [
      user.id,
      vendorProfile?.id,
      vendorProfile?.auth_user_id,
    ].filter(Boolean);

    const productQuery = supabaseAdmin
      .from("marketplace_products")
      .select("id, vendor_id, images, status")
      .eq("id", productId);

    const { data: product, error: productError } =
      profile.role === "admin"
        ? await productQuery.maybeSingle()
        : await productQuery.in("vendor_id", vendorIdCandidates).maybeSingle();

    if (productError) {
      throw new Error(productError.message);
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or access denied." },
        { status: 404 }
      );
    }

    const extension = getFileExtension(file);
    const originalName = safeFileName(file.name || `image.${extension}`);
    const path = `${product.vendor_id || user.id}/${product.id}/${Date.now()}-${originalName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Could not generate image public URL." },
        { status: 500 }
      );
    }

    const existingImages = getSafeImageArray(product.images);
    const nextImages = Array.from(new Set([...existingImages, publicUrl]));

    const nextStatus =
      profile.role === "admin"
        ? product.status || "approved"
        : "pending_review";

    const nextIsActive =
      profile.role === "admin"
        ? ["approved", "active", "published"].includes(nextStatus)
        : true;

    const { error: updateError } = await supabaseAdmin
      .from("marketplace_products")
      .update({
        images: nextImages,
        status: nextStatus,
        is_active: nextIsActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      ok: true,
      productId: product.id,
      imageUrl: publicUrl,
      images: nextImages,
      status: nextStatus,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("Vendor product image upload failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not upload product image.",
      },
      { status: 500 }
    );
  }
}
