"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CommissionScopeType =
  | "global"
  | "studio"
  | "vendor"
  | "product"
  | "service_type";

type CommissionSetting = {
  id?: string;
  scopeType: CommissionScopeType;
  scopeId: string;
  scopeLabel: string;
  commissionRate: number;
  isActive: boolean;
  notes: string;
};

type TargetOption = {
  scopeType: CommissionScopeType;
  id: string;
  label: string;
};

const scopeOptions: { value: CommissionScopeType; label: string }[] = [
  { value: "global", label: "Global default" },
  { value: "studio", label: "Studio" },
  { value: "vendor", label: "Vendor" },
  { value: "product", label: "Product" },
  { value: "service_type", label: "Service type" },
];

const serviceTypes = [
  { id: "studio_booking", label: "Studio booking" },
  { id: "marketplace_product", label: "Marketplace product" },
  { id: "membership", label: "Membership" },
  { id: "acceleration", label: "Acceleration" },
];

function formatRate(value: number) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function createEmptyForm(): CommissionSetting {
  return {
    scopeType: "global",
    scopeId: "",
    scopeLabel: "Global default commission",
    commissionRate: 15,
    isActive: true,
    notes: "",
  };
}

export default function AdminCommissionSettingsManager({
  initialSettings,
  targetOptions,
}: AdminCommissionSettingsManagerProps) {
  const router = useRouter();

  const [settings, setSettings] = useState<CommissionSetting[]>(initialSettings);
  const [form, setForm] = useState<CommissionSetting>(createEmptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredTargetOptions = useMemo(() => {
    if (form.scopeType === "service_type") {
      return serviceTypes.map((item) => ({
        scopeType: "service_type" as CommissionScopeType,
        id: item.id,
        label: item.label,
      }));
    }

    return targetOptions.filter((option) => option.scopeType === form.scopeType);
  }, [form.scopeType, targetOptions]);

  function updateForm<K extends keyof CommissionSetting>(
    key: K,
    value: CommissionSetting[K]
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "scopeType") {
        const nextScopeType = value as CommissionScopeType;

        if (nextScopeType === "global") {
          next.scopeId = "";
          next.scopeLabel = "Global default commission";
        } else {
          next.scopeId = "";
          next.scopeLabel = "";
        }
      }

      return next;
    });
  }

  function selectTarget(scopeId: string) {
    if (form.scopeType === "global") {
      setForm((current) => ({
        ...current,
        scopeId: "",
        scopeLabel: "Global default commission",
      }));
      return;
    }

    const selected = filteredTargetOptions.find((item) => item.id === scopeId);

    setForm((current) => ({
      ...current,
      scopeId,
      scopeLabel: selected?.label || current.scopeLabel,
    }));
  }

  function editSetting(setting: CommissionSetting) {
    setForm({
      id: setting.id,
      scopeType: setting.scopeType,
      scopeId: setting.scopeId || "",
      scopeLabel: setting.scopeLabel || "",
      commissionRate: Number(setting.commissionRate || 15),
      isActive: Boolean(setting.isActive),
      notes: setting.notes || "",
    });

    setMessage("");
    setErrorMessage("");
  }

  async function saveSetting() {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const rate = Number(form.commissionRate);

    if (Number.isNaN(rate) || rate < 10 || rate > 30) {
      setErrorMessage("Commission rate must be between 10% and 30%.");
      setIsSaving(false);
      return;
    }

    if (form.scopeType !== "global" && !form.scopeId.trim()) {
      setErrorMessage("Select or enter a target ID for this commission rule.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/commission-settings/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          scopeType: form.scopeType,
          scopeId: form.scopeType === "global" ? "" : form.scopeId,
          scopeLabel:
            form.scopeType === "global"
              ? "Global default commission"
              : form.scopeLabel,
          commissionRate: rate,
          isActive: form.isActive,
          notes: form.notes,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not save commission setting.");
        return;
      }

      const savedSetting = result?.setting as CommissionSetting | undefined;

      if (savedSetting) {
        setSettings((current) => {
          const existingIndex = current.findIndex(
            (item) => item.id === savedSetting.id
          );

          if (existingIndex >= 0) {
            return current.map((item) =>
              item.id === savedSetting.id ? savedSetting : item
            );
          }

          const duplicateIndex = current.findIndex(
            (item) =>
              item.scopeType === savedSetting.scopeType &&
              (item.scopeId || "") === (savedSetting.scopeId || "")
          );

          if (duplicateIndex >= 0) {
            return current.map((item, index) =>
              index === duplicateIndex ? savedSetting : item
            );
          }

          return [savedSetting, ...current];
        });
      }

      setMessage("Commission setting saved successfully.");
      setForm(createEmptyForm());
      router.refresh();
    } catch {
      setErrorMessage("Could not save commission setting.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(setting: CommissionSetting) {
    setForm({
      ...setting,
      isActive: !setting.isActive,
    });

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/commission-settings/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...setting,
          isActive: !setting.isActive,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not update setting.");
        return;
      }

      const savedSetting = result?.setting as CommissionSetting | undefined;

      if (savedSetting) {
        setSettings((current) =>
          current.map((item) =>
            item.id === savedSetting.id ? savedSetting : item
          )
        );
      }

      setMessage("Commission status updated.");
      router.refresh();
    } catch {
      setErrorMessage("Could not update setting.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Commission setup</p>
            <h2>Add or update commission rule</h2>
            <p className="gb-muted-text">
              Set GearBeat commission between 10% and 30%. More specific rules
              can override the global default later when payout logic is added.
            </p>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

        <div className="gb-form-grid">
          <label>
            <span>Scope</span>
            <select
              className="gb-input"
              value={form.scopeType}
              onChange={(event) =>
                updateForm(
                  "scopeType",
                  event.target.value as CommissionScopeType
                )
              }
            >
              {scopeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {form.scopeType !== "global" ? (
            <label>
              <span>Target</span>
              <select
                className="gb-input"
                value={form.scopeId}
                onChange={(event) => selectTarget(event.target.value)}
              >
                <option value="">Select target</option>
                {filteredTargetOptions.map((option) => (
                  <option key={`${option.scopeType}-${option.id}`} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {form.scopeType !== "global" ? (
            <label>
              <span>Manual target ID</span>
              <input
                className="gb-input"
                type="text"
                value={form.scopeId}
                onChange={(event) => updateForm("scopeId", event.target.value)}
                placeholder="Use this if the target is not in the dropdown"
              />
            </label>
          ) : null}

          <label>
            <span>Label</span>
            <input
              className="gb-input"
              type="text"
              value={form.scopeLabel}
              onChange={(event) =>
                updateForm("scopeLabel", event.target.value)
              }
              placeholder="Example: Premium Studio A"
            />
          </label>

          <label>
            <span>Commission rate %</span>
            <input
              className="gb-input"
              type="number"
              min={10}
              max={30}
              step={0.5}
              value={form.commissionRate}
              onChange={(event) =>
                updateForm("commissionRate", Number(event.target.value))
              }
            />
          </label>

          <label>
            <span>Active</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateForm("isActive", event.target.checked)
              }
            />
          </label>

          <label>
            <span>Internal notes</span>
            <textarea
              className="gb-input"
              rows={3}
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              placeholder="Optional notes for admin use"
            />
          </label>
        </div>

        <div className="gb-action-row">
          <button
            type="button"
            className="gb-button"
            onClick={saveSetting}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save commission rule"}
          </button>

          <button
            type="button"
            className="gb-button gb-button-secondary"
            onClick={() => setForm(createEmptyForm())}
            disabled={isSaving}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Current rules</p>
            <h2>Commission settings</h2>
            <p className="gb-muted-text">
              These settings will be used by payout and settlement reports in
              the next patch.
            </p>
          </div>
        </div>

        {settings.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No commission settings yet</h3>
            <p>Create the global default commission first.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Target</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => (
                  <tr key={setting.id || `${setting.scopeType}-${setting.scopeId}`}>
                    <td>{setting.scopeType}</td>
                    <td>{setting.scopeLabel || setting.scopeId || "Global"}</td>
                    <td>{formatRate(setting.commissionRate)}</td>
                    <td>{setting.isActive ? "Active" : "Inactive"}</td>
                    <td>{setting.notes || "-"}</td>
                    <td>
                      <div className="gb-action-row">
                        <button
                          type="button"
                          className="gb-button gb-button-small"
                          onClick={() => editSetting(setting)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="gb-button gb-button-small gb-button-secondary"
                          onClick={() => toggleActive(setting)}
                          disabled={isSaving}
                        >
                          {setting.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

type AdminCommissionSettingsManagerProps = {
  initialSettings: CommissionSetting[];
  targetOptions: TargetOption[];
};
