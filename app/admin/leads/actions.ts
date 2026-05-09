"use server";

import { getSignedDocumentUrl, getSignedDocumentUrlAction as getSecureSignedUrlAction } from "@/lib/storage/provider-documents";
import { getSignedContractUrl } from "@/lib/storage/signed-contracts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole, isAdminRole } from "@/lib/auth-guards";
import { sendEmail } from "@/lib/emails";
import { revalidatePath } from "next/cache";

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export async function getLeadOrApplicationDetail(id: string) {
  const supabaseAdmin = createAdminClient();

  // 1. Try provider_leads
  const { data: lead } = await supabaseAdmin
    .from("provider_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (lead) {
    let studioApp = null;
    if (lead.type === "studio") {
      const { data: app } = await supabaseAdmin
        .from("studio_applications")
        .select("*")
        .eq("email", lead.email)
        .maybeSingle();
      studioApp = app;
    }
    return { lead, studioApp };
  }

  // 2. Try studio_applications directly
  const { data: studioApp } = await supabaseAdmin
    .from("studio_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (studioApp) {
    const mockLead = {
      id: studioApp.id,
      full_name: studioApp.full_name,
      email: studioApp.email,
      phone: studioApp.phone,
      status: studioApp.status || 'pending',
      created_at: studioApp.created_at,
      type: 'studio'
    };
    return { lead: mockLead, studioApp };
  }

  return { lead: null, studioApp: null };
}

export async function approveStudioApplication(appId: string, commissionRate: number, studioLimit: number, contractDraft?: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const supabase = await createClient();

    // Get current admin user
    const { data: authData } = await supabase.auth.getUser();
    const adminUser = authData?.user;

    // 1. Fetch application details
    const { data: app, error: fetchError } = await supabaseAdmin
      .from("studio_applications")
      .select("*")
      .eq("id", appId)
      .maybeSingle();

    if (fetchError || !app) throw new Error("Application not found");

    // Update contract draft if provided
    if (contractDraft) {
      await supabaseAdmin.from("studio_applications").update({ contract_draft: contractDraft }).eq("id", appId);
    }

    // 2. Use a fixed temp password for testing convenience
    const tempPassword = "GearBeat123!";

    // 3. Create or Get Auth User
    let userId: string;
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === app.email);

    if (existingUser) {
      userId = existingUser.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
        user_metadata: {
          full_name: app.full_name,
          role: "studio_owner",
          company_name: app.company_name_en
        }
      });
    } else {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: app.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: app.full_name,
          role: "studio_owner",
          company_name: app.company_name_en
        }
      });

      if (authError) throw new Error(`Auth Error: ${authError.message}`);
      if (!authUser.user) throw new Error("Failed to create user object");
      userId = authUser.user.id;
    }

    // 4. Update/Create Profile Role
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      auth_user_id: userId,
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      role: "studio_owner",
      account_status: "approved", 
      updated_at: new Date().toISOString()
    });

    if (profileError) throw new Error(`Profile Update Error: ${profileError.message}`);

    // 5. Update Application Status
    const { error: updateError } = await supabaseAdmin
      .from("studio_applications")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: adminUser?.id,
        linked_user_id: userId,
        commission_rate: commissionRate,
        studio_limit: studioLimit,
      })
      .eq("id", appId);

    if (updateError) throw new Error(`Status Update Error: ${updateError.message}`);

    // 6. Send Approval Email
    try {
      const subjectEn = "Congratulations! Your GearBeat application is approved";
      const subjectAr = "تهانينا! تمت الموافقة على طلبكم في GearBeat";

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #080706; color: #fff; padding: 40px; border-radius: 24px; border: 1px solid #D4AF37;">
          <h1 style="color: #D4AF37; text-align: center; font-size: 24px;">Welcome to GearBeat Ecosystem</h1>
          <h2 style="color: #D4AF37; text-align: center; font-size: 22px; direction: rtl;">مرحباً بك في منظومة GearBeat</h2>
          <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 30px 0;">
          <div style="margin-bottom: 30px;">
            <p style="font-size: 1.1rem; line-height: 1.6;">Your application for <strong>${app.company_name_en}</strong> has been approved!</p>
            <p style="font-size: 1.1rem; line-height: 1.6; text-align: right; direction: rtl;">تمت الموافقة على طلب انضمام شركتكم <strong>${app.company_name_ar}</strong>!</p>
          </div>
          <div style="background: rgba(212, 175, 55, 0.05); padding: 24px; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.2); margin-bottom: 30px;">
            <h3 style="color: #D4AF37; margin-top: 0;">Login Credentials / بيانات الدخول</h3>
            <p><strong>Login URL:</strong> <a href="https://gearbeat.app/portal/login" style="color: #D4AF37;">gearbeat.app/portal/login</a></p>
            <p><strong>Email:</strong> ${app.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #222; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
            <p style="font-size: 0.85rem; color: #888;">* Please change your password upon first login.</p>
          </div>
          <div style="margin-bottom: 30px;">
            <h3 style="color: #D4AF37;">Next Steps / الخطوات القادمة</h3>
            <p>Your custom contract is ready for review in your dashboard. Please sign and upload it to activate your account.</p>
            <p style="text-align: right; direction: rtl;">عقدكم المخصص جاهز للمراجعة في لوحة التحكم الخاصة بكم. يرجى توقيعه ورفعه لتفعيل الحساب.</p>
          </div>
          <div style="border-top: 1px solid #1a1a1a; padding-top: 20px; font-size: 0.9rem; color: #666; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} GearBeat Ecosystem. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: app.email,
        subject: `${subjectEn} | ${subjectAr}`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.warn("Email sending failed:", emailErr);
    }

    revalidatePath("/admin/leads");
    return { success: true, tempPassword };
  } catch (err: any) {
    console.error("Approve Studio Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during approval." };
  }
}

export async function giveFinalApproval(appId: string) {
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  // 1. Get Application details
  const { data: app } = await supabaseAdmin
    .from("studio_applications")
    .select("*")
    .eq("id", appId)
    .single();

  if (!app) throw new Error("Application not found");
  
  if (!app.contract_url) {
    throw new Error("Cannot activate: Signed contract has not been uploaded.");
  }

  // 2. Mark Final Approved and Activated
  const { error } = await supabaseAdmin
    .from("studio_applications")
    .update({
      final_approved_at: new Date().toISOString(),
      final_approved_by: adminUser?.id,
      status: 'activated' // Changed from 'approved' to hide it from Join Requests
    })
    .eq("id", appId);

  if (error) throw error;

  // 3. Create Studio Record if it doesn't exist
  if (app.linked_user_id) {
    // Check if studio already exists for this owner
    const { data: existingStudio } = await supabaseAdmin
      .from("studios")
      .select("id")
      .eq("owner_auth_user_id", app.linked_user_id)
      .maybeSingle();

    if (!existingStudio) {
      const { error: studioError } = await supabaseAdmin
        .from("studios")
        .insert({
          owner_auth_user_id: app.linked_user_id,
          name: app.company_name_en || app.full_name,
          name_en: app.company_name_en || app.full_name,
          name_ar: app.company_name_ar || app.full_name,
          city: app.city || '—',
          city_name: app.city || '—',
          description: app.about_company,
          status: 'approved',
          verified: true,
          booking_enabled: true,
          completion_score: 10,
        });
      
      if (studioError) console.error("Error creating studio record:", studioError);
    } else {
      // Prevent duplicates and safely link if needed
      console.log("Studio already exists for this owner, skipping auto-creation.");
      
      // Optional: Update studio status if it was pending
      await supabaseAdmin
        .from("studios")
        .update({ status: 'approved', verified: true })
        .eq("id", existingStudio.id)
        .eq("status", "pending");
    }
  }

  // 4. Activate User Account
  if (app.linked_user_id) {
    await supabaseAdmin
      .from("profiles")
      .update({ account_status: 'active' })
      .or(`auth_user_id.eq.${app.linked_user_id},id.eq.${app.linked_user_id}`);
  } else if (app.email) {
    await supabaseAdmin
      .from("profiles")
      .update({ account_status: 'active' })
      .eq("email", app.email);
  }

  // 5. Update Lead Status
  if (app.email) {
    await supabaseAdmin
      .from("provider_leads")
      .update({ status: 'approved' })
      .eq("email", app.email);
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/studios");
  revalidatePath("/portal/studio");
  revalidatePath("/portal/pending");
  return { success: true };
}

export async function requestLeadUpdate(leadId: string, message: string) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("provider_leads").update({ status: "needs_update" }).eq("id", leadId);
  const { data: lead } = await supabaseAdmin.from("provider_leads").select("email").eq("id", leadId).single();

  if (lead) {
    await sendEmail({
      to: lead.email,
      subject: "Action Required: Update your GearBeat application",
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border: 1px solid #cfa86e; border-radius: 20px;">
          <h2 style="color: #cfa86e;">Modification Requested</h2>
          <p>Our team reviewed your application and found some missing or incorrect information:</p>
          <div style="background: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">${message}</div>
          <p>Please log in or contact support to provide the requested updates.</p>
        </div>
      `
    });
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function rejectLeadApplication(leadId: string, reason: string) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("provider_leads").update({ status: "rejected" }).eq("id", leadId);
  const { data: lead } = await supabaseAdmin.from("provider_leads").select("email").eq("id", leadId).single();

  if (lead) {
    await sendEmail({
      to: lead.email,
      subject: "Update regarding your GearBeat application",
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border: 1px solid #ef4444; border-radius: 20px;">
          <h2 style="color: #ef4444;">Application Declined</h2>
          <p>Thank you for your interest in GearBeat. Unfortunately, we cannot proceed with your application at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
      `
    });
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function getSignedContractAction(contractUrl: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const role = await getCurrentUserRole(supabase, user);
    if (!isAdminRole(role)) throw new Error("Forbidden: Admin access required");

    const signedUrl = await getSignedContractUrl(contractUrl);
    return { success: true, url: signedUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSignedDocumentUrlAction(documentUrl: string, appId?: string) {
  // Proxy to the hardened general action which handles admin bypass
  return getSecureSignedUrlAction(documentUrl, appId);
}
