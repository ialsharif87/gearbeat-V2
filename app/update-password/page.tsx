"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import T from "../../components/t";

export default function UpdatePasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password updated successfully. You can now login.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <section>
      <div className="card form">
        <span className="badge">
          <T en="Update Password" ar="تحديث كلمة المرور" />
        </span>

        <h1>
          <T en="Create New Password" ar="إنشاء كلمة مرور جديدة" />
        </h1>

        <p>
          <T
            en="Enter your new password below."
            ar="أدخل كلمة المرور الجديدة أدناه."
          />
        </p>

        <form onSubmit={handleUpdatePassword}>
          <label>
            <T en="New password" ar="كلمة المرور الجديدة" />
          </label>

          <input
            className="input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label>
            <T en="Confirm password" ar="تأكيد كلمة المرور" />
          </label>

          <input
            className="input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {errorMessage ? (
            <p className="error">
              {errorMessage === "Password must be at least 6 characters." ? (
                <T
                  en="Password must be at least 6 characters."
                  ar="يجب أن تكون كلمة المرور 6 أحرف على الأقل."
                />
              ) : errorMessage === "Passwords do not match." ? (
                <T
                  en="Passwords do not match."
                  ar="كلمتا المرور غير متطابقتين."
                />
              ) : (
                errorMessage
              )}
            </p>
          ) : null}

          {message ? (
            <p className="success">
              <T
                en="Password updated successfully. You can now login."
                ar="تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول."
              />
            </p>
          ) : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <T en="Updating..." ar="جاري التحديث..." />
            ) : (
              <T en="Update Password" ar="تحديث كلمة المرور" />
            )}
          </button>
        </form>

        <div className="actions">
          <Link href="/login" className="btn btn-secondary">
            <T en="Back to Login" ar="العودة إلى تسجيل الدخول" />
          </Link>
        </div>
      </div>
    </section>
  );
}
