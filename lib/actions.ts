"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitProviderLead(formData: FormData, type: "studio" | "seller") {
  const name = formData.get("name")?.toString();
  const businessName = formData.get("business_name")?.toString();
  const email = formData.get("email")?.toString();
  const city = formData.get("city")?.toString();
  const message = formData.get("message")?.toString();

  if (!name || !businessName || !email || !city) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("provider_leads").insert({
    name,
    business_name: businessName,
    email,
    city,
    message,
    type,
    status: "new",
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error saving lead:", error);
    return { error: "Something went wrong. Please try again later." };
  }

  return { success: true };
}
