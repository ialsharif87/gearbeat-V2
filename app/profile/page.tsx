import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";
import PhoneVerificationManager from "../../components/phone-verification-manager";
import CustomerAccountNav from "../../components/customer-account-nav";

function cleanPhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function cleanIdentityNumber(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function getFullName(user: any, profile: any) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    ""
  );
}

function getPhone(user: any, profile: any) {
  return (
    profile?.phone ||
    user?.phone ||
    user?.user_metadata?.phone ||
    user?.user_metadata?.phone_number ||
    user?.user_metadata?.mobile ||
    user?.user_metadata?.mobile_number ||
    ""
  );
}

function getRole(user: any, profile: any) {
  return profile?.role || user?.user_metadata?.role || "customer";
}

function getRoleLabel(role: string) {
  if (role === "owner" || role === "studio_owner") {
    return "Studio Owner / صاحب استوديو";
  }

  if (role === "customer") {
    return "Customer / عميل";
  }

  return role;
}

function getIdentityType(user: any, profile: any) {
  return profile?.identity_type || user?.user_metadata?.identity_type || "";
}

function getIdentityNumber(user: any, profile: any) {
  return profile?.identity_number || user?.user_metadata?.identity_number || "";
}

function getIdentityLabel(identityType: string) {
  if (identityType === "national_id") return "National ID / هوية وطنية";
  if (identityType === "iqama") return "Iqama / إقامة";
  if (identityType === "passport") return "Passport / جواز سفر";
  if (identityType === "gcc_id") return "GCC ID / هوية خليجية";
  return "-";
}

const socialLinks = [
  "Instagram",
  "TikTok",
  "X / Twitter",
  "YouTube",
  "LinkedIn",
  "Facebook",
  "Website",
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, admin_role, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id,auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked,identity_created_at,account_status,deletion_requested_at,updated_at"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const currentFullName = getFullName(user, profile);
  const currentPhone = getPhone(user, profile);
  const currentRole = getRole(user, profile);
  const currentEmail = profile?.email || user.email || "";
  const currentIdentityType = getIdentityType(user, profile);
  const currentIdentityNumber = getIdentityNumber(user, profile);

  const identityIsLocked =
    Boolean(profile?.identity_locked) &&
    Boolean(currentIdentityType) &&
    Boolean(currentIdentityNumber);

  const accountStatus = profile?.account_status || "active";
  const userInitials =
    currentFullName
      .trim()
      .split(/\s+/)
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    currentEmail.charAt(0).toUpperCase() ||
    "U";

  async function updateProfile(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (adminUser) {
      redirect("/admin");
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("role,identity_type,identity_number,identity_locked,account_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existingProfile?.account_status === "pending_deletion") {
      throw new Error("This account is pending deletion and cannot be updated.");
    }

    if (existingProfile?.account_status === "deleted") {
      throw new Error("This account has been deleted.");
    }

    const existingRole =
      existingProfile?.role || user.user_metadata?.role || "customer";

    const fullName = String(formData.get("full_name") || "").trim();
    const phone = cleanPhone(String(formData.get("phone") || ""));

    const existingIdentityType =
      existingProfile?.identity_type ||
      user.user_metadata?.identity_type ||
      "";

    const existingIdentityNumber =
      existingProfile?.identity_number ||
      user.user_metadata?.identity_number ||
      "";

    const existingIdentityLocked =
      Boolean(existingProfile?.identity_locked) &&
      Boolean(existingIdentityType) &&
      Boolean(existingIdentityNumber);

    let finalIdentityType = existingIdentityType;
    let finalIdentityNumber = existingIdentityNumber;
    let finalIdentityLocked = existingIdentityLocked;

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!phone) {
      throw new Error("Phone number is required.");
    }

    if (phone.length < 8) {
      throw new Error("Please enter a valid phone number.");
    }

    const allowedRoles = ["customer", "owner", "studio_owner"];

    if (!allowedRoles.includes(existingRole)) {
      throw new Error("Invalid account type.");
    }

    if (!existingIdentityLocked) {
      const identityType = String(formData.get("identity_type") || "").trim();
      const identityNumber = cleanIdentityNumber(
        String(formData.get("identity_number") || "")
      );

      const allowedIdentityTypes = [
        "national_id",
        "iqama",
        "passport",
        "gcc_id",
      ];

      if (!allowedIdentityTypes.includes(identityType)) {
        throw new Error("Identity type is required.");
      }

      if (!identityNumber || identityNumber.length < 5) {
        throw new Error("Please enter a valid identity number.");
      }

      finalIdentityType = identityType;
      finalIdentityNumber = identityNumber;
      finalIdentityLocked = true;
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        name: fullName,
        phone,
        phone_number: phone,
        mobile: phone,
        role: existingRole,
        identity_type: finalIdentityType,
        identity_number: finalIdentityNumber,
        identity_locked: finalIdentityLocked,
      },
    });

    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        auth_user_id: user.id,
        email: user.email,
        full_name: fullName,
        phone,
        role: existingRole,
        identity_type: finalIdentityType,
        identity_number: finalIdentityNumber,
        identity_locked: finalIdentityLocked,
        identity_created_at: finalIdentityLocked
          ? new Date().toISOString()
          : null,
        account_status: existingProfile?.account_status || "active",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "auth_user_id",
      }
    );

    if (profileError) {
      throw new Error(profileError.message);
    }

    revalidatePath("/profile");
    revalidatePath("/admin/owner-bank-accounts");
    revalidatePath("/admin");

    redirect("/profile");
  }

  return (
    <>
      <CustomerAccountNav />
      <main className="gb-customer-page">
        <section className="gb-customer-header gb-profile-hero">
          <div className="gb-profile-identity">
            <div className="gb-profile-avatar" aria-hidden="true">
              {userInitials}
            </div>

            <div>
              <p className="gb-eyebrow">
                <T en="Account center" ar="مركز الحساب" />
              </p>
              <h1 style={{ marginTop: 10 }}>
                {currentFullName || <T en="My Profile" ar="ملفي الشخصي" />}
              </h1>
              <p className="gb-muted-text" style={{ marginTop: 8 }}>
                {currentEmail}
              </p>

              <div className="gb-chip-row">
                <span className="gb-chip gb-chip-warning">
                  {getRoleLabel(currentRole)}
                </span>
                <span className="gb-chip">{accountStatus}</span>
                <span
                  className={
                    user.email_confirmed_at
                      ? "gb-chip gb-chip-success"
                      : "gb-chip"
                  }
                >
                  <T
                    en={
                      user.email_confirmed_at
                        ? "Email verified"
                        : "Email not verified"
                    }
                    ar={
                      user.email_confirmed_at
                        ? "البريد موثق"
                        : "البريد غير موثق"
                    }
                  />
                </span>
                <span
                  className={
                    user.phone_confirmed_at
                      ? "gb-chip gb-chip-success"
                      : "gb-chip"
                  }
                >
                  <T
                    en={
                      user.phone_confirmed_at
                        ? "Phone verified"
                        : "Phone not verified"
                    }
                    ar={
                      user.phone_confirmed_at
                        ? "الجوال موثق"
                        : "الجوال غير موثق"
                    }
                  />
                </span>
                <span
                  className={
                    identityIsLocked ? "gb-chip gb-chip-success" : "gb-chip"
                  }
                >
                  <T
                    en={identityIsLocked ? "Identity saved" : "Identity required"}
                    ar={identityIsLocked ? "الهوية محفوظة" : "الهوية مطلوبة"}
                  />
                </span>
              </div>
            </div>
          </div>

          <Link href="/customer" className="btn">
            <T en="Customer Dashboard" ar="لوحة العميل" />
          </Link>
        </section>

        <div className="gb-customer-shell">
          {accountStatus === "pending_deletion" ? (
            <div className="profile-warning-box gb-account-section">
              <strong>
                <T en="Account deletion requested" ar="تم طلب حذف الحساب" />
              </strong>
              <p>
                <T
                  en="Your account is pending deletion review. Profile updates are disabled until the request is reviewed."
                  ar="حسابك قيد مراجعة طلب الحذف. تم إيقاف تعديل الملف الشخصي حتى تتم مراجعة الطلب."
                />
              </p>
            </div>
          ) : null}

          <div className="gb-account-grid">
            <form className="form" action={updateProfile}>
              <section className="gb-account-section">
                <span className="badge badge-gold">
                  <T en="Personal information" ar="المعلومات الشخصية" />
                </span>
                <p className="admin-muted-line" style={{ marginTop: 10 }}>
                  <T
                    en="Keep your name, customer account type, and account status easy to review."
                    ar="راجع اسمك ونوع الحساب وحالة الحساب من مكان واحد."
                  />
                </p>

                <div className="gb-account-form-grid">
                  <label>
                    <T en="Full name" ar="الاسم الكامل" />
                    <input
                      className="input"
                      name="full_name"
                      type="text"
                      defaultValue={currentFullName}
                      placeholder="Your full name"
                      required
                      minLength={2}
                      disabled={accountStatus === "pending_deletion"}
                    />
                  </label>

                  <label>
                    <T en="Account type" ar="نوع الحساب" />
                    <input
                      className="input"
                      name="role_display"
                      type="text"
                      value={getRoleLabel(currentRole)}
                      readOnly
                    />
                  </label>

                  <label>
                    <T en="Account status" ar="حالة الحساب" />
                    <input
                      className="input"
                      name="account_status_display"
                      type="text"
                      value={accountStatus}
                      readOnly
                    />
                  </label>
                </div>
              </section>

              <section className="gb-account-section">
                <span className="badge badge-gold">
                  <T en="Contact information" ar="معلومات التواصل" />
                </span>

                <div className="gb-account-form-grid">
                  <label>
                    <T en="Email address" ar="البريد الإلكتروني" />
                    <span
                      className={
                        user.email_confirmed_at
                          ? "gb-chip gb-chip-success"
                          : "gb-chip"
                      }
                      style={{ marginInlineStart: 8 }}
                    >
                      <T
                        en={user.email_confirmed_at ? "Verified" : "Not verified"}
                        ar={user.email_confirmed_at ? "موثق" : "غير موثق"}
                      />
                    </span>
                    <input
                      className="input"
                      name="email"
                      type="email"
                      value={currentEmail}
                      readOnly
                    />
                  </label>

                  <label>
                    <T en="Phone number" ar="رقم الجوال" />
                    <span
                      className={
                        user.phone_confirmed_at
                          ? "gb-chip gb-chip-success"
                          : "gb-chip"
                      }
                      style={{ marginInlineStart: 8 }}
                    >
                      <T
                        en={user.phone_confirmed_at ? "Verified" : "Not verified"}
                        ar={user.phone_confirmed_at ? "موثق" : "غير موثق"}
                      />
                    </span>
                    <input
                      className="input"
                      name="phone"
                      type="tel"
                      defaultValue={currentPhone}
                      placeholder="+9665XXXXXXXX"
                      required
                      minLength={8}
                      disabled={accountStatus === "pending_deletion"}
                    />
                  </label>
                </div>

                <p className="admin-muted-line">
                  <T
                    en="Email cannot be changed from this page for security reasons."
                    ar="لا يمكن تغيير البريد الإلكتروني من هذه الصفحة لأسباب أمنية."
                  />
                </p>

                <PhoneVerificationManager
                  phone={currentPhone}
                  isVerified={Boolean(user.phone_confirmed_at)}
                />
              </section>

              <section className="gb-account-section">
                <span className="badge badge-gold">
                  <T en="Verification & security" ar="التحقق والأمان" />
                </span>

                {identityIsLocked ? (
                  <div className="gb-account-form-grid">
                    <label>
                      <T en="Identity type" ar="نوع الهوية" />
                      <input
                        className="input"
                        name="identity_type_display"
                        type="text"
                        value={getIdentityLabel(currentIdentityType)}
                        readOnly
                      />
                    </label>

                    <label>
                      <T en="Identity number" ar="رقم الهوية" />
                      <input
                        className="input"
                        name="identity_number_display"
                        type="text"
                        value={currentIdentityNumber}
                        readOnly
                      />
                    </label>

                    <p className="admin-muted-line">
                      <T
                        en="Identity details are locked and cannot be changed from this page."
                        ar="بيانات الهوية مقفلة ولا يمكن تغييرها من هذه الصفحة."
                      />
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="admin-muted-line">
                      <T
                        en="Your account is missing identity details. Please add them once. They cannot be changed later."
                        ar="حسابك لا يحتوي على بيانات الهوية. الرجاء إضافتها مرة واحدة فقط. لا يمكن تغييرها لاحقًا."
                      />
                    </p>

                    <div className="gb-account-form-grid">
                      <label>
                        <T en="Identity type" ar="نوع الهوية" />
                        <select
                          className="input"
                          name="identity_type"
                          required
                          disabled={accountStatus === "pending_deletion"}
                        >
                          <option value="">Select identity type / اختر نوع الهوية</option>
                          <option value="national_id">National ID / هوية وطنية</option>
                          <option value="iqama">Iqama / إقامة</option>
                          <option value="passport">Passport / جواز سفر</option>
                          <option value="gcc_id">GCC ID / هوية خليجية</option>
                        </select>
                      </label>

                      <label>
                        <T en="Identity number" ar="رقم الهوية" />
                        <input
                          className="input"
                          name="identity_number"
                          type="text"
                          placeholder="Identity / Iqama / Passport number"
                          required
                          minLength={5}
                          disabled={accountStatus === "pending_deletion"}
                        />
                      </label>
                    </div>
                  </>
                )}
              </section>

              <section className="gb-account-section">
                <span className="badge badge-gold">
                  <T en="Social links" ar="روابط التواصل" />
                </span>
                <p className="admin-muted-line" style={{ marginTop: 10 }}>
                  <T
                    en="Social links are prepared for a future profile update and are not saved yet."
                    ar="روابط التواصل جاهزة لمرحلة لاحقة ولا يتم حفظها حاليًا."
                  />
                </p>

                <div className="gb-social-link-grid">
                  {socialLinks.map((label) => (
                    <label key={label}>
                      {label}
                      <input
                        className="input"
                        type="url"
                        placeholder="Coming soon / سيتم تفعيلها قريبًا"
                        disabled
                      />
                    </label>
                  ))}
                </div>
              </section>

              {accountStatus !== "pending_deletion" ? (
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ marginTop: 18 }}
                >
                  <T en="Save Profile" ar="حفظ البيانات" />
                </button>
              ) : null}
            </form>

            <aside>
              <section className="gb-account-section">
                <span className="badge badge-gold">
                  <T en="Preferences" ar="التفضيلات" />
                </span>
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  <div className="gb-chip-row">
                    <span className="gb-chip">
                      <T
                        en="Language follows site setting"
                        ar="اللغة حسب إعداد الموقع"
                      />
                    </span>
                    <span className="gb-chip">
                      <T
                        en="Currency shown where available"
                        ar="تظهر العملة عند توفرها"
                      />
                    </span>
                  </div>
                  <p className="admin-muted-line">
                    <T
                      en="Editable preferences will be enabled after the profile schema supports them."
                      ar="سيتم تفعيل تعديل التفضيلات بعد دعمها في بيانات الملف."
                    />
                  </p>
                </div>
              </section>

              <section className="profile-danger-zone gb-account-section">
                <span className="badge">
                  <T en="Danger Zone" ar="منطقة حساسة" />
                </span>

                <h2 style={{ marginTop: 12 }}>
                  <T en="Delete account" ar="حذف الحساب" />
                </h2>

                <p>
                  <T
                    en="You can request to delete your account. Some booking records may remain for legal, operational, reporting, or safety purposes."
                    ar="يمكنك طلب حذف حسابك. قد تبقى بعض سجلات الحجوزات لأغراض قانونية أو تشغيلية أو تقارير أو أمان."
                  />
                </p>

                <Link href="/account/delete" className="btn btn-secondary">
                  <T en="Request Account Deletion" ar="طلب حذف الحساب" />
                </Link>
              </section>

              {currentRole === "owner" || currentRole === "studio_owner" ? (
                <section className="gb-account-section">
                  <Link href="/portal/studio" className="btn btn-secondary">
                    <T en="Owner Dashboard" ar="لوحة صاحب الاستوديو" />
                  </Link>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
