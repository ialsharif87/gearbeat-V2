"use client";

import { useEffect, useState } from "react";
import T from "@/components/t";

type ApiKeyRow = {
  id: string;
  key_name: string;
  key_prefix: string;
  permissions: string[];
  status: string;
  last_used_at?: string | null;
  created_at?: string | null;
  revoked_at?: string | null;
};

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [keyName, setKeyName] = useState("Main Integration Key");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadKeys() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/vendor/integrations/api-keys");
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not load API keys.");
      }

      setKeys(Array.isArray(data?.keys) ? data.keys : []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load API keys."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setLoading(true);
    setMessage("");
    setNewKey("");

    try {
      const response = await fetch("/api/vendor/integrations/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not create API key.");
      }

      setNewKey(data.rawKey || "");
      setMessage(data.message || "API key created.");
      await loadKeys();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create API key."
      );
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/vendor/integrations/api-keys/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not revoke API key.");
      }

      setMessage(data.message || "API key revoked.");
      await loadKeys();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not revoke API key."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="card" style={{ display: "grid", gap: 18 }}>
      <div>
        <span className="badge badge-gold">
          <T en="API Keys" ar="مفاتيح API" />
        </span>

        <h2 style={{ marginTop: 10 }}>
          <T en="Vendor API access" ar="ربط API للتاجر" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Create API keys to connect your external system with GearBeat."
            ar="أنشئ مفاتيح API لربط نظامك الخارجي مع GearBeat."
          />
        </p>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <label>
          <T en="Key name" ar="اسم المفتاح" />
        </label>

        <input
          className="input"
          value={keyName}
          onChange={(event) => setKeyName(event.target.value)}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={createKey}
          disabled={loading}
        >
          <T en="Create API key" ar="إنشاء مفتاح API" />
        </button>
      </div>

      {newKey ? (
        <div
          className="card"
          style={{
            borderColor: "rgba(255,176,32,0.35)",
            background: "rgba(255,176,32,0.08)",
          }}
        >
          <strong>
            <T en="Copy this key now" ar="انسخ هذا المفتاح الآن" />
          </strong>

          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="This key will not be shown again."
              ar="لن يظهر هذا المفتاح مرة أخرى."
            />
          </p>

          <code
            style={{
              display: "block",
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              background: "rgba(0,0,0,0.35)",
              wordBreak: "break-all",
            }}
          >
            {newKey}
          </code>
        </div>
      ) : null}

      {message ? (
        <div className="card">
          <p style={{ color: "var(--muted)", margin: 0 }}>{message}</p>
        </div>
      ) : null}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Status</th>
              <th>Last Used</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                  <T en="No API keys yet." ar="لا توجد مفاتيح API بعد." />
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id}>
                  <td>{key.key_name}</td>
                  <td>{key.key_prefix}...</td>
                  <td>
                    <span
                      className={
                        key.status === "active"
                          ? "badge badge-success"
                          : "badge"
                      }
                    >
                      {key.status}
                    </span>
                  </td>
                  <td>{formatDate(key.last_used_at)}</td>
                  <td>{formatDate(key.created_at)}</td>
                  <td>
                    {key.status === "active" ? (
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => revokeKey(key.id)}
                        disabled={loading}
                      >
                        <T en="Revoke" ar="إلغاء" />
                      </button>
                    ) : (
                      <span className="badge">
                        <T en="Revoked" ar="ملغي" />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
