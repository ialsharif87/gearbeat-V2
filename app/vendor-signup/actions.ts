"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpVendor(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const businessName = formData.get("businessName") as string;

  if (!email || !password || !fullName || !businessName) {
    return { error: "All fields are required." };
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

  const { error: profileError } = await supabaseAdmin
    .from("vendor_profiles")
    .insert({
      id: authData.user.id,
      business_name_en: businessName,
      business_name_ar: businessName, // Temporary, can be updated later
      slug,
      contact_email: email,
      status: "pending",
    });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // Note: User is already created in Auth. We might want to handle this better in a real app.
  }

  return redirect("/login?created=true&account=vendor");
}
