"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getActiveCountries } from "@/lib/countries";
import { isValidE164, normalizePhoneToE164 } from "@/lib/phone";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function redirectWithError(message: string): never {
  redirect(`/vendor-signup?error=${encodeURIComponent(message)}`);
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
      console.error(
        "Failed to clean up auth user after vendor signup failure:",
        error
      );
    }
  } catch (error) {
    console.error("Unexpected auth cleanup error:", error);
  }
}

export async function signUpVendor(formData: FormData): Promise<void> {
  const email = normalizeEmail(getText(formData, "email"));
  const password = getText(formData, "password");
  const fullName = getText(formData, "fullName");
  const businessName = getText(formData, "businessName");
  const countryCode = getText(formData, "country_code");
  const phoneCountryCode = getText(formData, "phone_country_code");
  const phoneLocal = getText(formData, "phone_local");
  const rawPhoneE164 = getText(formData, "phone_e164");

  const countries = await getActiveCountries();

  const selectedCountry = countries.find(
    (country) => country.country_code === countryCode
  );

  const phoneE164 =
    rawPhoneE164 ||
    normalizePhoneToE164({
      countryCode,
      localPhone: phoneLocal,
      countries,
    });

  if (
    !email ||
    !password ||
    !fullName ||
    !businessName ||
    !countryCode ||
    !phoneE164
  ) {
    redirectWithError("جميع الحقول مطلوبة. / All fields are required.");
  }

  if (!selectedCountry) {
    redirectWithError("الدولة المختارة غير صحيحة. / Selected country is invalid.");
  }

  if (!isValidEmail(email)) {
    redirectWithError("البريد الإلكتروني غير صحيح. / Email address is invalid.");
  }

  if (!isValidE164(phoneE164)) {
    redirectWithError(
      "رقم الجوال غير صحيح. اختر الدولة واكتب رقم الهاتف بشكل صحيح. / Phone number is invalid. Select a country and enter a valid number."
    );
  }

  if (fullName.length < 2) {
    redirectWithError("الاسم الكامل قصير جدًا. / Full name is too short.");
  }

  if (businessName.length < 2) {
    redirectWithError("اسم المتجر قصير جدًا. / Business name is too short.");
  }

  if (password.length < 8) {
    redirectWithError(
      "كلمة المرور يجب أن تكون 8 أحرف على الأقل. / Password must be at least 8 characters."
    );
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
    redirectWithError(
      "حدث خطأ أثناء التحقق من البريد الإلكتروني. / Could not verify email availability."
    );
  }

  if (existingVendorByEmail) {
    redirectWithError(
      "يوجد طلب تاجر مسجل بهذا البريد الإلكتروني. / A vendor application already exists with this email."
    );
  }

  const { data: existingProfileByEmail, error: existingProfileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

  if (existingProfileError) {
    console.error("Profile email lookup error:", existingProfileError);
    redirectWithError(
      "حدث خطأ أثناء التحقق من الحساب. / Could not verify account availability."
    );
  }

  if (existingProfileByEmail) {
    redirectWithError(
      "يوجد حساب مسجل بهذا البريد الإلكتروني. / An account already exists with this email."
    );
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        phone: phoneE164,
      },
    },
  });

  if (authError) {
    console.error("Vendor auth signup error:", authError);
    redirectWithError(
      "تعذر إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى. / Could not create account. Please check your details and try again."
    );
  }

  if (!authData.user) {
    redirectWithError("تعذر إنشاء الحساب. / Signup failed.");
  }

  const authUserId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    auth_user_id: authUserId,
    email,
    full_name: fullName,
    phone: phoneE164,
    country_code: countryCode,
    phone_country_code: phoneCountryCode || selectedCountry.phone_code,
    phone_e164: phoneE164,
    phone_verified: false,
    role: "vendor",
    account_status: "active",
    preferred_currency: selectedCountry.currency_code,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("Vendor profile table creation error:", profileError);
    await deleteAuthUserSafely(supabaseAdmin, authUserId);

    redirectWithError(
      "فشل إنشاء ملف المستخدم. الرجاء المحاولة مرة أخرى. / Failed to create user profile. Please try again."
    );
  }

  const { error: vendorProfileError } = await supabaseAdmin
    .from("vendor_profiles")
    .insert({
      id: authUserId,
      business_name_en: businessName,
      business_name_ar: businessName,
      slug,
      contact_email: email,
      contact_phone: phoneE164,
      country_code: countryCode,
      business_verification_status: "not_started",
      document_verification_status: "not_started",
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

    redirectWithError(
      "فشل إنشاء ملف التاجر. الرجاء المحاولة مرة أخرى. / Failed to create vendor profile. Please try again."
    );
  }

  redirect("/login?created=true&account=vendor");
}
