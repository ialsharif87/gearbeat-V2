"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

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
        <span className="badge">Account Recovery</span>

        <h1>Forgot Password</h1>

        <p>
          Enter your email address and we will send you a link to reset your
          password.
        </p>

        <form onSubmit={handleResetPassword}>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {errorMessage ? <p className="error">{errorMessage}</p> : null}
          {message ? <p className="success">{message}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="actions">
          <Link href="/login" className="btn btn-secondary">
            Back to Login
          </Link>
        </div>
      </div>
    </section>
  );
}
