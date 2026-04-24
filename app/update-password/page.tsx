"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

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
        <span className="badge">Update Password</span>

        <h1>Create New Password</h1>

        <p>Enter your new password below.</p>

        <form onSubmit={handleUpdatePassword}>
          <label>New password</label>
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label>Confirm password</label>
          <input
            className="input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {errorMessage ? <p className="error">{errorMessage}</p> : null}
          {message ? <p className="success">{message}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
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
