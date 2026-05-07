"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

    // 2. Generate temp password
    const tempPassword = generatePassword();

    // 3. Create Auth User
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

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        // Find existing user to link instead of failing
        const { data: existingUser } = await supabaseAdmin.from("profiles").select("id").eq("email", app.email).maybeSingle();
        if (existingUser) {
           throw new Error("This email is already registered and linked to a profile.");
        }
        throw new Error("A user with this email already exists in Auth but has no profile.");
      }
      throw new Error(`Auth Error: ${authError.message}`);
    }

    if (!authUser.user) throw new Error("Failed to create user object");

    // 4. Update/Create Profile Role
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: authUser.user.id,
      auth_user_id: authUser.user.id,
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      role: "studio_owner",
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
        linked_user_id: authUser.user.id,
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
      // Don't throw here, as the user was created successfully
    }

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err: any) {
    console.error("Approve Studio Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during approval." };
  }
}

export async function giveFinalApproval(appId: string) {
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  const { error } = await supabaseAdmin
    .from("studio_applications")
    .update({
      final_approved_at: new Date().toISOString(),
      final_approved_by: adminUser?.id,
    })
    .eq("id", appId);

  if (error) throw error;

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function requestLeadUpdate(leadId: string, message: string) {
  const supabaseAdmin = createAdminClient();
  
  // 1. Update status
  await supabaseAdmin
    .from("provider_leads")
    .update({ status: "needs_update" })
    .eq("id", leadId);

  // 2. Fetch email
  const { data: lead } = await supabaseAdmin.from("provider_leads").select("email").eq("id", leadId).single();

  if (lead) {
    await sendEmail({
      to: lead.email,
      subject: "Action Required: Update your GearBeat application",
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border: 1px solid #cfa86e; border-radius: 20px;">
          <h2 style="color: #cfa86e;">Modification Requested</h2>
          <p>Our team reviewed your application and found some missing or incorrect information:</p>
          <div style="background: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">
            ${message}
          </div>
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

  await supabaseAdmin
    .from("provider_leads")
    .update({ status: "rejected" })
    .eq("id", leadId);

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
