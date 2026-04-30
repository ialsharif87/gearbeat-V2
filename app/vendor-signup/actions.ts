"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpVendor(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const businessName = formData.get("businessName") as string;
  const phone = (formData.get("phone") as string) || "";

  if (!email || !password || !fullName || !businessName) {
    return { error: "جميع الحقول مطلوبة. / All fields are required." };
  }

  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل. / Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Sign up user (WITHOUT role in metadata)
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

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Signup failed." };

  // 2. Create vendor profile with status pending
  // We use admin client to bypass RLS for initial creation if needed, 
  // though typically profiles should be insertable by the user themselves.
  // But here we want to ensure it's created correctly.
  
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 7);

  // 2a. Upsert into profiles table
  await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        role: "vendor",
        account_status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" }
    );

  // 2b. Create vendor profile with status pending
  const { error: profileError } = await supabaseAdmin
    .from("vendor_profiles")
    .insert({
      id: authData.user.id,
      business_name_en: businessName,
      business_name_ar: businessName,
      slug,
      contact_email: email,
      contact_phone: phone,
      status: "pending",
    });

  if (profileError) {
    console.error("Vendor profile creation error:", profileError);
  }

  return redirect("/login?created=true&account=vendor");
}
