"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import T from "../../components/t";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      "Password reset link sent. Please check your email and open the reset link."
    );
  }

  return (
    <section>
      <div className="card form">
        <span className="badge">
          <T en="Account Recovery" ar="استعادة الحساب" />
        </span>

        <h1>
          <T en="Forgot Password" ar="نسيت كلمة المرور" />
        </h1>

        <p>
          <T
            en="Enter your email address and we will send you a link to reset your password."
            ar="أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور."
          />
        </p>

        <form onSubmit={handleResetPassword}>
          <label>
            <T en="Email" ar="البريد الإلكتروني" />
          </label>

          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          {message ? (
            <p className="success">
              <T
                en="Password reset link sent. Please check your email and open the reset link."
                ar="تم إرسال رابط إعادة تعيين كلمة المرور. يرجى مراجعة بريدك الإلكتروني وفتح الرابط."
              />
            </p>
          ) : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <T en="Sending..." ar="جاري الإرسال..." />
            ) : (
              <T en="Send Reset Link" ar="إرسال رابط إعادة التعيين" />
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
