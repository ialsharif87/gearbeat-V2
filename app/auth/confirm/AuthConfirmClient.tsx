"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EMAIL_OTP_TYPES = new Set([
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email",
  "email_change",
]);

function readHashParams() {
  if (typeof window === "undefined" || !window.location.hash) {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function normalizeEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (!EMAIL_OTP_TYPES.has(normalized)) {
    return null;
  }

  return normalized as EmailOtpType;
}

function technicalReason(error: unknown) {
  return error instanceof Error ? error.message : String(error || "unknown");
}

export default function AuthConfirmClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let isMounted = true;

    async function ensureCustomerProfile() {
      const response = await fetch("/api/customer/profile/ensure", {
        method: "POST",
      });

      if (!response.ok) {
        let reason = "unknown";

        try {
          const body = await response.json();
          reason = body?.reason || reason;
        } catch {
          reason = "invalid_response";
        }

        console.warn("Customer confirmation profile ensure failed", { reason });
      }
    }

    async function finishConfirmedSession() {
      if (isMounted) {
        setMessage("Email confirmed. Preparing your account...");
      }

      await ensureCustomerProfile();

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.warn("Customer confirmation session clear failed", {
          message: signOutError.message,
        });
      }

      router.replace("/login?confirmed=1");
    }

    async function failConfirmation(reason: string) {
      console.warn("Customer email confirmation failed", { reason });
      router.replace("/login?confirmation_error=1");
    }

    async function confirmEmail() {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = readHashParams();
        const errorDescription =
          searchParams.get("error_description") ||
          searchParams.get("error") ||
          hashParams.get("error_description") ||
          hashParams.get("error");

        if (errorDescription) {
          await failConfirmation(errorDescription);
          return;
        }

        const code = searchParams.get("code") || hashParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            await failConfirmation(error.message);
            return;
          }

          await finishConfirmedSession();
          return;
        }

        const tokenHash =
          searchParams.get("token_hash") || hashParams.get("token_hash");
        const otpType = normalizeEmailOtpType(
          searchParams.get("type") || hashParams.get("type")
        );

        if (tokenHash && otpType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });

          if (error) {
            await failConfirmation(error.message);
            return;
          }

          await finishConfirmedSession();
          return;
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            await failConfirmation(error.message);
            return;
          }

          await finishConfirmedSession();
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          await failConfirmation(sessionError.message);
          return;
        }

        if (session?.user) {
          await finishConfirmedSession();
          return;
        }

        await failConfirmation("missing_confirmation_parameters");
      } catch (error) {
        await failConfirmation(technicalReason(error));
      }
    }

    void confirmEmail();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="badge badge-gold">GearBeat</span>
        <h1>{message}</h1>
        <p>Please keep this page open while we finish your confirmation.</p>
      </section>
      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          padding: 24px;
        }
        .auth-card {
          width: min(100%, 420px);
          padding: 40px;
          border-radius: 24px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.75rem;
        }
        .badge-gold {
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        h1 {
          margin: 18px 0 8px;
          font-size: 1.5rem;
        }
        p {
          margin: 0;
          color: #94a3b8;
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}
