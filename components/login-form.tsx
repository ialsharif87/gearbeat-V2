"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import T from "./t";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      setErrorMessage("Login failed. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    setLoading(false);

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    if (profile?.role === "owner") {
      router.push("/owner");
      router.refresh();
      return;
    }

    if (profile?.role === "vendor") {
      router.push("/vendor");
      router.refresh();
      return;
    }

    if (profile?.role === "admin") {
      router.push("/admin");
      router.refresh();
      return;
    }

    router.push("/customer");
    router.refresh();
  }

  return (
    <section>
      <div className="card form">
        <span className="badge">
          <T en="Welcome Back" ar="مرحبًا بعودتك" />
        </span>

        <h1>
          <T en="Login" ar="تسجيل الدخول" />
        </h1>

        <p>
          <T en="Access your GearBeat account." ar="ادخل إلى حسابك في GearBeat." />
        </p>

        <form onSubmit={handleLogin}>
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

          <label>
            <T en="Password" ar="كلمة المرور" />
          </label>
          <input
            className="input"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="login-help-row">
            <Link href="/forgot-password">
              <T en="Forgot password?" ar="نسيت كلمة المرور؟" />
            </Link>
          </div>

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <T en="Logging in..." ar="جاري تسجيل الدخول..." />
            ) : (
              <T en="Login" ar="تسجيل الدخول" />
            )}
          </button>
        </form>

        <div className="actions">
          <Link href="/signup" className="btn btn-secondary">
            <T en="Create account" ar="إنشاء حساب" />
          </Link>
        </div>
      </div>
    </section>
  );
}
