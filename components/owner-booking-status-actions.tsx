"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type OwnerBookingStatusActionsProps = {
  bookingId: string;
  currentStatus: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  pending_review: "Pending review",
  pending_owner_review: "Pending owner review",
  accepted: "Accepted",
  confirmed: "Confirmed",
  rejected: "Rejected",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No-show",
};

function getAvailableActions(currentStatus: string) {
  if (
    currentStatus === "pending" ||
    currentStatus === "pending_review" ||
    currentStatus === "pending_owner_review"
  ) {
    return [
      { status: "accepted", label: "Accept booking" },
      { status: "rejected", label: "Reject booking" },
    ];
  }

  if (currentStatus === "accepted") {
    return [
      { status: "confirmed", label: "Confirm booking" },
      { status: "cancelled", label: "Cancel booking" },
    ];
  }

  if (currentStatus === "confirmed") {
    return [
      { status: "completed", label: "Mark completed" },
      { status: "no_show", label: "Mark no-show" },
      { status: "cancelled", label: "Cancel booking" },
    ];
  }

  return [];
}

export default function OwnerBookingStatusActions({
  bookingId,
  currentStatus,
}: OwnerBookingStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ownerNotes, setOwnerNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const actions = useMemo(
    () => getAvailableActions(currentStatus),
    [currentStatus]
  );

  async function updateStatus(nextStatus: string) {
    setErrorMessage("");

    startTransition(async () => {
      const response = await fetch("/api/owner/bookings/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status: nextStatus,
          ownerNotes,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not update booking status.");
        return;
      }

      setOwnerNotes("");
      router.refresh();
    });
  }

  if (actions.length === 0) {
    return (
      <div className="gb-muted-text">
        No owner action available for:{" "}
        <strong>{statusLabels[currentStatus] || currentStatus}</strong>
      </div>
    );
  }

  return (
    <div className="gb-owner-booking-actions">
      <textarea
        value={ownerNotes}
        onChange={(event) => setOwnerNotes(event.target.value)}
        placeholder="Optional owner note"
        className="gb-input"
        rows={2}
      />

      <div className="gb-action-row">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={isPending}
            onClick={() => updateStatus(action.status)}
            className="gb-button gb-button-small"
          >
            {isPending ? "Updating..." : action.label}
          </button>
        ))}
      </div>

      {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}
    </div>
  );
}
