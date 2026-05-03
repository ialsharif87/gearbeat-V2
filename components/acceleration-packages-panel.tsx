"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import T from "./t";

export type AccelerationPackage = {
  id: string;
  title: string;
  description: string;
  partnerType: string;
  price: number;
  currency: string;
  durationDays: number;
  placement: string;
  isActive: boolean;
};

export type AccelerationOrder = {
  id: string;
  orderNumber: string;
  packageTitle: string;
  partnerType: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type Props = {
  mode: "admin" | "vendor" | "owner";
  partnerType?: "vendor" | "studio_owner";
  packages: AccelerationPackage[];
  orders: AccelerationOrder[];
};

function money(value: number, currency = "SAR") {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function AccelerationPackagesPanel({
  mode,
  partnerType,
  packages,
  orders,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [packagePartnerType, setPackagePartnerType] = useState("all");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [placement, setPlacement] = useState("featured");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function createPackage() {
    setMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/acceleration/packages/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          partnerType: packagePartnerType,
          price: Number(price),
          durationDays: Number(durationDays),
          placement,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not create package.");
        return;
      }

      setMessage("Package saved.");
      setTitle("");
      setPrice("");
      router.refresh();
    } catch {
      setErrorMessage("Could not create package.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createOrder(packageId: string) {
    setMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/acceleration/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, partnerType }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not create acceleration order.");
        return;
      }

      setMessage("Acceleration order created as pending.");
      router.refresh();
    } catch {
      setErrorMessage("Could not create acceleration order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      {message ? <p className="gb-success-text">{message}</p> : null}
      {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

      {mode === "admin" ? (
        <section className="gb-card">
          <div className="gb-card-header">
            <div>
              <p className="gb-eyebrow">Admin acceleration</p>
              <h2>Create package</h2>
            </div>
          </div>

          <div className="gb-form-grid">
            <label>
              <span>Title</span>
              <input className="gb-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label>
              <span>Description</span>
              <textarea className="gb-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <label>
              <span>Partner type</span>
              <select className="gb-input" value={packagePartnerType} onChange={(e) => setPackagePartnerType(e.target.value)}>
                <option value="all">All</option>
                <option value="vendor">Vendor</option>
                <option value="studio_owner">Studio owner</option>
              </select>
            </label>

            <label>
              <span>Price</span>
              <input className="gb-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>

            <label>
              <span>Duration days</span>
              <input className="gb-input" type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </label>

            <label>
              <span>Placement</span>
              <input className="gb-input" value={placement} onChange={(e) => setPlacement(e.target.value)} />
            </label>
          </div>

          <button className="gb-button" onClick={createPackage} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save package"}
          </button>
        </section>
      ) : null}

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">
              <T en="Acceleration packages" ar="باقات التعزيز" />
            </p>
            <h2>
              <T en="Available packages" ar="الباقات المتاحة" />
            </h2>
            <p className="gb-muted-text">
              <T
                en="Acceleration increases your studio visibility on GearBeat."
                ar="تعزيز الظهور يزيد من ظهور استوديوك على GearBeat."
              />
            </p>
          </div>
        </div>

        {packages.length === 0 ? (
          <div className="gb-empty-state">
            <h3>
              <T en="No packages" ar="لا توجد باقات" />
            </h3>
            <p>
              <T
                en="Packages will appear once admin creates them."
                ar="ستظهر الباقات بعد إنشائها من قبل الإدارة."
              />
            </p>
          </div>
        ) : (
          <div className="gb-card-grid">
            {packages.map((pkg) => (
              <article className="gb-card" key={pkg.id}>
                <h3>{pkg.title}</h3>
                <p className="gb-muted-text">{pkg.description}</p>
                <p><strong>{money(pkg.price, pkg.currency)}</strong></p>
                <p className="gb-muted-text">{pkg.durationDays} days — {pkg.placement}</p>
                {mode !== "admin" ? (
                  <button className="gb-button" disabled={isSaving} onClick={() => createOrder(pkg.id)}>
                    Request acceleration
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">
              <T en="Orders" ar="الطلبات" />
            </p>
            <h2>
              <T en="Acceleration orders" ar="طلبات التعزيز" />
            </h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="gb-empty-state">
            <h3>
              <T en="No orders yet" ar="لا توجد طلبات بعد" />
            </h3>
            <p>
              <T en="Orders will appear here." ar="ستظهر الطلبات هنا." />
            </p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.packageTitle}</td>
                    <td>{money(order.amount, order.currency)}</td>
                    <td>{order.status}</td>
                    <td>{order.paymentStatus}</td>
                    <td>{order.createdAt?.slice(0, 10) || "-"}</td>
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
