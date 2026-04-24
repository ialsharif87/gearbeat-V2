"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

function getDashboardPath(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "owner") return "/owner";
  return "/customer";
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorText(error.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", data.user.id)
      .single();

    if (profileError) {
      setErrorText(profileError.message);
      setLoading(false);
      return;
    }

    router.push(getDashboardPath(profile?.role));
    router.refresh();
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h1>Login</h1>

      <label>Email</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        required
      />

      <label>Password</label>
      <input
        className="input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {errorText ? <p className="error">{errorText}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
