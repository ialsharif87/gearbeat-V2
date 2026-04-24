"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";

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
        <span className="badge">Welcome Back</span>

        <h1>Login</h1>

        <p>Access your GearBeat account.</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="login-help-row">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="actions">
          <Link href="/signup" className="btn btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
