"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorText("");
    setSuccessText("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role
        }
      }
    });

    if (error) {
      setErrorText(error.message);
      setLoading(false);
      return;
    }

    setSuccessText(
      "Account created successfully. If email confirmation is enabled, confirm your email first, then login."
    );

    setFullName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setRole("customer");
    setLoading(false);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h1>Create Account</h1>

      <label>Full name</label>
      <input
        className="input"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        required
      />

      <label>Phone</label>
      <input
        className="input"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+966 5X XXX XXXX"
        required
      />

      <label>Account type</label>
      <select
        className="input"
        value={role}
        onChange={(e) => setRole(e.target.value as "customer" | "owner")}
      >
        <option value="customer">Customer</option>
        <option value="owner">Studio Owner</option>
      </select>

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
        placeholder="At least 8 characters"
        required
      />

      {errorText ? <p className="error">{errorText}</p> : null}
      {successText ? <p className="success">{successText}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign up"}
      </button>
    </form>
  );
}
