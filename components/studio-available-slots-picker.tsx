"use client";

import { useEffect, useState } from "react";

type AvailableSlot = {
  startTime: string;
  endTime: string;
  label: string;
};

type StudioAvailableSlotsPickerProps = {
  studioId: string;
  selectedDate: string;
  selectedStartTime?: string;
  onSlotSelect?: (slot: AvailableSlot) => void;
};

export default function StudioAvailableSlotsPicker({
  studioId,
  selectedDate,
  selectedStartTime,
  onSlotSelect,
}: StudioAvailableSlotsPickerProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSlots() {
      if (!studioId || !selectedDate) {
        setSlots([]);
        setMessage("");
        return;
      }

      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/studios/availability/slots?studioId=${encodeURIComponent(
            studioId
          )}&date=${encodeURIComponent(selectedDate)}`
        );

        const result = await response.json().catch(() => null);

        if (!isActive) return;

        if (!response.ok) {
          setSlots([]);
          setMessage(result?.error || "Could not load available slots.");
          return;
        }

        setSlots(Array.isArray(result?.slots) ? result.slots : []);
        setMessage(result?.reason || "");
      } catch {
        if (!isActive) return;

        setSlots([]);
        setMessage("Could not load available slots.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      isActive = false;
    };
  }, [studioId, selectedDate]);

  if (!selectedDate) {
    return (
      <div className="gb-muted-text" style={{ padding: '10px 0', color: 'var(--muted)' }}>
        Select a date to see available studio times.
      </div>
    );
  }

  if (isLoading) {
    return <div className="gb-muted-text" style={{ padding: '10px 0' }}>Loading available slots...</div>;
  }

  if (slots.length === 0) {
    return (
      <div className="gb-muted-text" style={{ padding: '10px 0', color: 'var(--muted)' }}>
        {message || "No available slots for this date."}
      </div>
    );
  }

  return (
    <div className="gb-slot-picker" style={{ marginTop: '16px' }}>
      <p className="gb-detail-label" style={{ fontWeight: 600, marginBottom: '8px' }}>Available times</p>
      <div className="gb-action-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {slots.map((slot) => {
          const isSelected = selectedStartTime === slot.startTime;

          return (
            <button
              key={slot.startTime}
              type="button"
              className={
                isSelected ? "gb-button" : "gb-button gb-button-secondary"
              }
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: isSelected ? 'var(--gb-blue)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => onSlotSelect?.(slot)}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
