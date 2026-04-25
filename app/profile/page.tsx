import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

function cleanPhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
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
    .select("id,auth_user_id,email,full_name,phone,role,updated_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const currentFullName = getFullName(user, profile);
  const currentPhone = getPhone(user, profile);
  const currentRole = getRole(user, profile);
  const currentEmail = profile?.email || user.email || "";

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
      .select("role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const existingRole =
      existingProfile?.role || user.user_metadata?.role || "customer";

    const fullName = String(formData.get("full_name") || "").trim();
    const phone = cleanPhone(String(formData.get("phone") || ""));

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

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        name: fullName,
        phone,
        phone_number: phone,
        mobile: phone,
        role: existingRole
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
              en="Keep your name and phone number updated so bookings are clear for studios and admins."
              ar="حدّث اسمك ورقم جوالك حتى تكون الحجوزات واضحة للاستوديوهات والإدارة."
            />
          </p>

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

            <button className="btn" type="submit">
              <T en="Save Profile" ar="حفظ البيانات" />
            </button>
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
        </div>
      </div>
    </section>
  );
}
