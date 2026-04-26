import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

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
  if (role === "owner") return "Studio Owner / صاحب استوديو";
  if (role === "customer") return "Customer / عميل";
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
  return "—";
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

  async function updateProfile(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
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

    const allowedRoles = ["customer", "owner"];

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
        "gcc_id"
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
        identity_locked: finalIdentityLocked
      }
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
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "auth_user_id"
      }
    );

    if (profileError) {
      throw new Error(profileError.message);
    }

    revalidatePath("/profile");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");

    redirect("/profile");
  }

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">
          <span className="badge">
            <T en="Profile" ar="الملف الشخصي" />
          </span>

          <h1>
            <T en="My Profile" ar="ملفي الشخصي" />
          </h1>

          <p>
            <T
              en="Keep your name and phone number updated. Identity details are locked after they are saved."
              ar="حدّث اسمك ورقم جوالك. بيانات الهوية يتم قفلها بعد حفظها."
            />
          </p>

          {accountStatus === "pending_deletion" ? (
            <div className="profile-warning-box">
              <strong>
                <T
                  en="Account deletion requested"
                  ar="تم طلب حذف الحساب"
                />
              </strong>
              <p>
                <T
                  en="Your account is pending deletion review. Profile updates are disabled until the request is reviewed."
                  ar="حسابك قيد مراجعة طلب الحذف. تم إيقاف تعديل الملف الشخصي حتى تتم مراجعة الطلب."
                />
              </p>
            </div>
          ) : null}

          <form className="form" action={updateProfile}>
            <label>
              <T en="Full name" ar="الاسم الكامل" />
            </label>
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

            <label>
              <T en="Email address" ar="البريد الإلكتروني" />
            </label>
            <input
              className="input"
              name="email"
              type="email"
              value={currentEmail}
              readOnly
            />

            <p className="admin-muted-line">
              <T
                en="Email cannot be changed from this page for security reasons."
                ar="لا يمكن تغيير البريد الإلكتروني من هذه الصفحة لأسباب أمنية."
              />
            </p>

            <label>
              <T en="Phone number" ar="رقم الجوال" />
            </label>
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

            <label>
              <T en="Account type" ar="نوع الحساب" />
            </label>
            <input
              className="input"
              name="role_display"
              type="text"
              value={getRoleLabel(currentRole)}
              readOnly
            />

            <p className="admin-muted-line">
              <T
                en="Account type cannot be changed from this page. It is selected during signup."
                ar="لا يمكن تغيير نوع الحساب من هذه الصفحة. يتم اختياره عند إنشاء الحساب."
              />
            </p>

            <label>
              <T en="Account status" ar="حالة الحساب" />
            </label>
            <input
              className="input"
              name="account_status_display"
              type="text"
              value={accountStatus}
              readOnly
            />

            <div className="profile-identity-box">
              <span className="badge">
                <T en="Identity Details" ar="بيانات الهوية" />
              </span>

              {identityIsLocked ? (
                <>
                  <label>
                    <T en="Identity type" ar="نوع الهوية" />
                  </label>
                  <input
                    className="input"
                    name="identity_type_display"
                    type="text"
                    value={getIdentityLabel(currentIdentityType)}
                    readOnly
                  />

                  <label>
                    <T en="Identity number" ar="رقم الهوية" />
                  </label>
                  <input
                    className="input"
                    name="identity_number_display"
                    type="text"
                    value={currentIdentityNumber}
                    readOnly
                  />

                  <p className="admin-muted-line">
                    <T
                      en="Identity details are locked and cannot be changed from this page."
                      ar="بيانات الهوية مقفلة ولا يمكن تغييرها من هذه الصفحة."
                    />
                  </p>
                </>
              ) : (
                <>
                  <p className="admin-muted-line">
                    <T
                      en="Your account is missing identity details. Please add them once. They cannot be changed later."
                      ar="حسابك لا يحتوي على بيانات الهوية. الرجاء إضافتها مرة واحدة فقط. لا يمكن تغييرها لاحقًا."
                    />
                  </p>

                  <label>
                    <T en="Identity type" ar="نوع الهوية" />
                  </label>
                  <select
                    className="input"
                    name="identity_type"
                    required
                    disabled={accountStatus === "pending_deletion"}
                  >
                    <option value="">
                      Select identity type / اختر نوع الهوية
                    </option>
                    <option value="national_id">
                      National ID / هوية وطنية
                    </option>
                    <option value="iqama">Iqama / إقامة</option>
                    <option value="passport">Passport / جواز سفر</option>
                    <option value="gcc_id">GCC ID / هوية خليجية</option>
                  </select>

                  <label>
                    <T en="Identity number" ar="رقم الهوية" />
                  </label>
                  <input
                    className="input"
                    name="identity_number"
                    type="text"
                    placeholder="Identity / Iqama / Passport number"
                    required
                    minLength={5}
                    disabled={accountStatus === "pending_deletion"}
                  />
                </>
              )}
            </div>

            {accountStatus !== "pending_deletion" ? (
              <button className="btn" type="submit">
                <T en="Save Profile" ar="حفظ البيانات" />
              </button>
            ) : null}
          </form>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/customer" className="btn btn-secondary">
              <T en="Customer Dashboard" ar="لوحة العميل" />
            </Link>

            {currentRole === "owner" ? (
              <Link href="/owner" className="btn btn-secondary">
                <T en="Owner Dashboard" ar="لوحة صاحب الاستوديو" />
              </Link>
            ) : null}
          </div>

          <div className="profile-danger-zone">
            <span className="badge">
              <T en="Danger Zone" ar="منطقة حساسة" />
            </span>

            <h2>
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
          </div>
        </div>
      </div>
    </section>
  );
}
