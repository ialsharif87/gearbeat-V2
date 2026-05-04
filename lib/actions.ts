"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitProviderLead(formData: FormData, type: "studio" | "seller") {
  const businessName = formData.get("business_name")?.toString();
  const email = formData.get("email")?.toString();
  const city = formData.get("city")?.toString();
  
  const managerName = formData.get("manager_name")?.toString();
  const managerPhone = formData.get("manager_phone")?.toString();
  const website = formData.get("website")?.toString();

  if (!businessName || !email || !city || !managerName || !managerPhone) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("provider_leads").insert({
    name: managerName,
    business_name: businessName,
    email,
    city,
    type,
    status: "new",
    message: website ? `Website: ${website}` : "",
    created_at: new Date().toISOString(),
    // We'll store extra info in a metadata column if it exists, or just use these
    // If the schema allows, we'll add more columns later
  });

  if (error) {
    console.error("Error saving lead:", error);
    return { error: "Something went wrong. Please try again later." };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
