"use client";

import { useState } from "react";
import T from "@/components/t";

export default function SetupButton({ type, createAction }: { type: string, createAction: (fd: FormData) => Promise<any> }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAction(formData);

    if (result?.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Success! Account created.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleAction}>
      <input type="hidden" name="type" value={type} />
      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ 
          width: '100%', 
          height: 54, 
          fontWeight: 800, 
          fontSize: '1rem',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10
        }} 
        disabled={loading}
      >
        {loading ? "..." : <><T en={`Create ${type} account`} ar={`إنشاء حساب ${type === 'seller' ? 'تاجر' : 'استوديو'}`} /></>}
      </button>
      {message && (
        <div style={{ 
          marginTop: 16, 
          fontSize: '0.85rem', 
          color: message.startsWith('✅') ? '#22c55e' : '#ef4444',
          textAlign: 'center',
          fontWeight: 600,
          background: message.startsWith('✅') ? 'rgba(34,197,94,0.05)' : 'rgba(239, 68, 68, 0.05)',
          padding: '8px 12px',
          borderRadius: 8
        }}>
          {message}
        </div>
      )}
    </form>
  );
}
