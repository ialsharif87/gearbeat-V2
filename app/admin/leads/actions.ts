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

export async function approveStudioApplication(appId: string, commissionRate: number, studioLimit: number) {
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();

  // Get current admin user
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  // 1. Fetch application details
  const { data: app, error: fetchError } = await supabaseAdmin
    .from("studio_applications")
    .select("*")
    .eq("id", appId)
    .single();

  if (fetchError || !app) throw new Error("Application not found");

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
    if (authError.message.includes("already registered")) {
        throw new Error("A user with this email already exists.");
    }
    throw authError;
  }

  // 4. Update Profile Role
  await supabaseAdmin.from("profiles").upsert({
    id: authUser.user.id,
    auth_user_id: authUser.user.id,
    full_name: app.full_name,
    email: app.email,
    role: "studio_owner",
    updated_at: new Date().toISOString()
  });

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

  if (updateError) throw updateError;

  // 6. Send Approval Email
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
        <ul style="line-height: 1.8;">
          <li>Download and sign the <a href="https://gearbeat.app/contracts/studio-agreement.pdf" style="color: #D4AF37; font-weight: bold;">Studio Agreement Contract</a></li>
          <li>Upload the signed contract in your portal under "Contract & Activation"</li>
          <li>Once verified, you can start adding up to <strong>${studioLimit}</strong> studios.</li>
        </ul>
        <p style="text-align: right; direction: rtl; line-height: 1.8;">
          - قم بتحميل وتوقيع <a href="https://gearbeat.app/contracts/studio-agreement.pdf" style="color: #D4AF37; font-weight: bold;">عقد اتفاقية الاستوديو</a><br>
          - ارفع العقد الموقع في البوابة الخاصة بك تحت قسم "العقد والتفعيل"<br>
          - بمجرد التحقق، يمكنك البدء في إضافة ما يصل إلى <strong>${studioLimit}</strong> استوديوهات.
        </p>
      </div>

      <div style="border-top: 1px solid #1a1a1a; padding-top: 20px; font-size: 0.9rem; color: #666; text-align: center;">
        <p>Commission Rate: ${commissionRate}% | Studio Limit: ${studioLimit}</p>
        <p>&copy; ${new Date().getFullYear()} GearBeat Ecosystem. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: app.email,
    subject: `${subjectEn} | ${subjectAr}`,
    html: emailHtml
  });

  revalidatePath("/admin/leads");
  return { success: true };
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
