"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import T from "@/components/t";

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
    <div className="gb-dashboard-stack" style={{ gap: '16px' }}>
      <textarea
        value={ownerNotes}
        onChange={(event) => setOwnerNotes(event.target.value)}
        placeholder="Add a note for the customer..."
        className="gb-input"
        style={{ minHeight: '80px', fontSize: '0.9rem', resize: 'none', background: 'rgba(255,255,255,0.03)' }}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={isPending}
            onClick={() => updateStatus(action.status)}
            className={`gb-button ${action.status === 'accepted' || action.status === 'confirmed' || action.status === 'completed' ? 'gb-button-primary' : 'gb-button-outline'}`}
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              fontSize: '0.85rem', 
              height: '42px',
              border: action.status === 'rejected' || action.status === 'cancelled' || action.status === 'no_show' ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
              color: action.status === 'rejected' || action.status === 'cancelled' || action.status === 'no_show' ? '#ef4444' : undefined
            }}
          >
            {isPending ? <T en="Wait..." ar="انتظر..." /> : (
              action.status === 'accepted' ? <T en="Accept" ar="قبول" /> :
              action.status === 'rejected' ? <T en="Reject" ar="رفض" /> :
              action.status === 'confirmed' ? <T en="Confirm" ar="تأكيد" /> :
              action.status === 'cancelled' ? <T en="Cancel" ar="إلغاء" /> :
              action.status === 'completed' ? <T en="Complete" ar="إكمال" /> :
              action.status === 'no_show' ? <T en="No Show" ar="عدم حضور" /> : action.label
            )}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="gb-error-text" style={{ fontSize: '0.8rem', margin: 0, textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
