"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type VendorSignupResult = {
  error?: string;
};

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "vendor";
}

async function generateUniqueVendorSlug(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  businessName: string
) {
  const baseSlug = slugify(businessName);
  const randomPart = Math.random().toString(36).slice(2, 7);
  const firstCandidate = `${baseSlug}-${randomPart}`;

  const { data: existingFirstCandidate, error: firstLookupError } =
    await supabaseAdmin
      .from("vendor_profiles")
      .select("id")
      .eq("slug", firstCandidate)
      .maybeSingle();

  if (firstLookupError) {
    throw new Error(firstLookupError.message);
  }

  if (!existingFirstCandidate) {
    return firstCandidate;
  }

  for (let index = 2; index <= 10; index += 1) {
    const candidate = `${baseSlug}-${index}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const { data: existingVendor, error } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!existingVendor) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

async function deleteAuthUserSafely(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Failed to clean up auth user after vendor signup failure:", error);
    }
  } catch (error) {
    console.error("Unexpected auth cleanup error:", error);
  }
}

export async function signUpVendor(
  formData: FormData
): Promise<VendorSignupResult | never> {
  const email = normalizeEmail(getText(formData, "email"));
  const password = getText(formData, "password");
  const fullName = getText(formData, "fullName");
  const businessName = getText(formData, "businessName");
  const phone = normalizePhone(getText(formData, "phone"));

  if (!email || !password || !fullName || !businessName || !phone) {
    return {
      error: "جميع الحقول مطلوبة. / All fields are required.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      error: "البريد الإلكتروني غير صحيح. / Email address is invalid.",
    };
  }

  if (fullName.length < 2) {
    return {
      error: "الاسم الكامل قصير جدًا. / Full name is too short.",
    };
  }

  if (businessName.length < 2) {
    return {
      error: "اسم المتجر قصير جدًا. / Business name is too short.",
    };
  }

  if (password.length < 8) {
    return {
      error:
        "كلمة المرور يجب أن تكون 8 أحرف على الأقل. / Password must be at least 8 characters.",
    };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const slug = await generateUniqueVendorSlug(supabaseAdmin, businessName);

  const { data: existingVendorByEmail, error: existingVendorError } =
    await supabaseAdmin
      .from("vendor_profiles")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();

  if (existingVendorError) {
    console.error("Vendor email lookup error:", existingVendorError);
    return {
      error:
        "حدث خطأ أثناء التحقق من البريد الإلكتروني. / Could not verify email availability.",
    };
  }

  if (existingVendorByEmail) {
    return {
      error:
        "يوجد طلب تاجر مسجل بهذا البريد الإلكتروني. / A vendor application already exists with this email.",
    };
  }

  const { data: existingProfileByEmail, error: existingProfileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

  if (existingProfileError) {
    console.error("Profile email lookup error:", existingProfileError);
    return {
      error:
        "حدث خطأ أثناء التحقق من الحساب. / Could not verify account availability.",
    };
  }

  if (existingProfileByEmail) {
    return {
      error:
        "يوجد حساب مسجل بهذا البريد الإلكتروني. / An account already exists with this email.",
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        phone,
      },
    },
  });

  if (authError) {
    console.error("Vendor auth signup error:", authError);
    return {
      error:
        "تعذر إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى. / Could not create account. Please check your details and try again.",
    };
  }

  if (!authData.user) {
    return {
      error: "تعذر إنشاء الحساب. / Signup failed.",
    };
  }

  const authUserId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    auth_user_id: authUserId,
    email,
    full_name: fullName,
    phone,
    role: "vendor",
    account_status: "active",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("Vendor profile table creation error:", profileError);
    await deleteAuthUserSafely(supabaseAdmin, authUserId);

    return {
      error:
        "فشل إنشاء ملف المستخدم. الرجاء المحاولة مرة أخرى. / Failed to create user profile. Please try again.",
    };
  }

  const { error: vendorProfileError } = await supabaseAdmin
    .from("vendor_profiles")
    .insert({
      id: authUserId,
      business_name_en: businessName,
      business_name_ar: businessName,
      slug,
      contact_email: email,
      contact_phone: phone,
      status: "pending",
      updated_at: new Date().toISOString(),
    });

  if (vendorProfileError) {
    console.error("Vendor profile creation error:", vendorProfileError);

    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("auth_user_id", authUserId);

    await deleteAuthUserSafely(supabaseAdmin, authUserId);

    return {
      error:
        "فشل إنشاء ملف التاجر. الرجاء المحاولة مرة أخرى. / Failed to create vendor profile. Please try again.",
    };
  }

  redirect("/login?created=true&account=vendor");
}
