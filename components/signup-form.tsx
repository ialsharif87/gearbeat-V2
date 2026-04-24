"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import T from "./t";

export default function SignupForm() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

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

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <section>
      <div className="card form">
        <span className="badge">
          <T en="Join GearBeat" ar="انضم إلى GearBeat" />
        </span>

        <h1>
          <T en="Create Account" ar="إنشاء حساب" />
        </h1>

        <p>
          <T
            en="Create your account as a customer, studio owner, or vendor."
            ar="أنشئ حسابك كعميل أو صاحب استوديو أو متجر."
          />
        </p>

        <form onSubmit={handleSignup}>
          <label>
            <T en="Full name" ar="الاسم الكامل" />
          </label>
          <input
            className="input"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

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
            <T en="Phone" ar="رقم الجوال" />
          </label>
          <input
            className="input"
            type="tel"
            placeholder="+966..."
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <label>
            <T en="Account type" ar="نوع الحساب" />
          </label>
          <select
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="customer">Customer</option>
            <option value="owner">Studio Owner</option>
            <option value="vendor">Vendor / Store</option>
          </select>

          <label>
            <T en="Password" ar="كلمة المرور" />
          </label>
          <input
            className="input"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <T en="Creating account..." ar="جاري إنشاء الحساب..." />
            ) : (
              <T en="Create Account" ar="إنشاء حساب" />
            )}
          </button>
        </form>

        <div className="actions">
          <Link href="/login" className="btn btn-secondary">
            <T en="Already have an account?" ar="لديك حساب بالفعل؟" />
          </Link>
        </div>
      </div>
    </section>
  );
}
