"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AvailabilityRule = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  bufferMinutes: number;
};

type AvailabilityException = {
  id?: string;
  exceptionDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
};

type StudioAvailabilityManagerProps = {
  studioId: string;
  studioName: string;
  initialRules: AvailabilityRule[];
  initialExceptions: AvailabilityException[];
};

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function createDefaultRules() {
  return days.map((day) => ({
    dayOfWeek: day.value,
    isOpen: day.value !== 5,
    openTime: "09:00",
    closeTime: "18:00",
    slotMinutes: 60,
    bufferMinutes: 0,
  }));
}

function normalizeRules(initialRules: AvailabilityRule[]) {
  const defaults = createDefaultRules();

  return defaults.map((defaultRule) => {
    const savedRule = initialRules.find(
      (rule) => rule.dayOfWeek === defaultRule.dayOfWeek
    );

    return savedRule || defaultRule;
  });
}

export default function StudioAvailabilityManager({
  studioId,
  studioName,
  initialRules,
  initialExceptions,
}: StudioAvailabilityManagerProps) {
  const router = useRouter();

  const [rules, setRules] = useState<AvailabilityRule[]>(
    normalizeRules(initialRules)
  );

  const [exceptions, setExceptions] =
    useState<AvailabilityException[]>(initialExceptions);

  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");
  const [newExceptionIsClosed, setNewExceptionIsClosed] = useState(true);
  const [newExceptionOpenTime, setNewExceptionOpenTime] = useState("09:00");
  const [newExceptionCloseTime, setNewExceptionCloseTime] = useState("18:00");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedExceptions = useMemo(() => {
    return [...exceptions].sort((a, b) =>
      a.exceptionDate.localeCompare(b.exceptionDate)
    );
  }, [exceptions]);

  function updateRule(
    dayOfWeek: number,
    key: keyof AvailabilityRule,
    value: string | number | boolean
  ) {
    setRules((currentRules) =>
      currentRules.map((rule) =>
        rule.dayOfWeek === dayOfWeek ? { ...rule, [key]: value } : rule
      )
    );
  }

  function addException() {
    setErrorMessage("");
    setMessage("");

    if (!newExceptionDate) {
      setErrorMessage("Select an exception date first.");
      return;
    }

    const alreadyExists = exceptions.some(
      (exception) => exception.exceptionDate === newExceptionDate
    );

    if (alreadyExists) {
      setErrorMessage("This date already has an exception.");
      return;
    }

    setExceptions((currentExceptions) => [
      ...currentExceptions,
      {
        exceptionDate: newExceptionDate,
        isClosed: newExceptionIsClosed,
        openTime: newExceptionOpenTime,
        closeTime: newExceptionCloseTime,
        reason: newExceptionReason,
      },
    ]);

    setNewExceptionDate("");
    setNewExceptionReason("");
    setNewExceptionIsClosed(true);
    setNewExceptionOpenTime("09:00");
    setNewExceptionCloseTime("18:00");
  }

  function removeException(exceptionDate: string) {
    setExceptions((currentExceptions) =>
      currentExceptions.filter(
        (exception) => exception.exceptionDate !== exceptionDate
      )
    );
  }

  async function saveAvailability() {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/owner/studios/availability/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioId,
          rules,
          exceptions,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not save availability.");
        return;
      }

      setMessage("Availability saved successfully.");
      router.refresh();
    } catch {
      setErrorMessage("Could not save availability.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="gb-card">
      <div className="gb-card-header">
        <div>
          <p className="gb-eyebrow">Studio availability</p>
          <h2>{studioName}</h2>
          <p className="gb-muted-text">
            Set weekly working hours, closed days, slot length, buffer time, and
            special date exceptions.
          </p>
        </div>

        <button
          type="button"
          className="gb-button"
          onClick={saveAvailability}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save availability"}
        </button>
      </div>

      {message ? <p className="gb-success-text">{message}</p> : null}
      {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

      <div className="gb-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="gb-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Open</th>
              <th>Open time</th>
              <th>Close time</th>
              <th>Slot minutes</th>
              <th>Buffer minutes</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const day = days.find((item) => item.value === rule.dayOfWeek);

              return (
                <tr key={rule.dayOfWeek}>
                  <td>{day?.label || rule.dayOfWeek}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={rule.isOpen}
                      onChange={(event) =>
                        updateRule(
                          rule.dayOfWeek,
                          "isOpen",
                          event.target.checked
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={rule.openTime}
                      disabled={!rule.isOpen}
                      onChange={(event) =>
                        updateRule(
                          rule.dayOfWeek,
                          "openTime",
                          event.target.value
                        )
                      }
                      className="gb-input"
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={rule.closeTime}
                      disabled={!rule.isOpen}
                      onChange={(event) =>
                        updateRule(
                          rule.dayOfWeek,
                          "closeTime",
                          event.target.value
                        )
                      }
                      className="gb-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={15}
                      max={720}
                      value={rule.slotMinutes}
                      disabled={!rule.isOpen}
                      onChange={(event) =>
                        updateRule(
                          rule.dayOfWeek,
                          "slotMinutes",
                          Number(event.target.value)
                        )
                      }
                      className="gb-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={240}
                      value={rule.bufferMinutes}
                      disabled={!rule.isOpen}
                      onChange={(event) =>
                        updateRule(
                          rule.dayOfWeek,
                          "bufferMinutes",
                          Number(event.target.value)
                        )
                      }
                      className="gb-input"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gb-section-divider" style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

      <div className="gb-card-header">
        <div>
          <p className="gb-eyebrow">Date exceptions</p>
          <h3>Closed dates or special hours</h3>
          <p className="gb-muted-text">
            Use this for holidays, private events, maintenance, or special
            working hours.
          </p>
        </div>
      </div>

      <div className="gb-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '24px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Date</span>
          <input
            type="date"
            value={newExceptionDate}
            onChange={(event) => setNewExceptionDate(event.target.value)}
            className="gb-input"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Closed all day</span>
          <input
            type="checkbox"
            checked={newExceptionIsClosed}
            onChange={(event) => setNewExceptionIsClosed(event.target.checked)}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Open time</span>
          <input
            type="time"
            value={newExceptionOpenTime}
            disabled={newExceptionIsClosed}
            onChange={(event) => setNewExceptionOpenTime(event.target.value)}
            className="gb-input"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Close time</span>
          <input
            type="time"
            value={newExceptionCloseTime}
            disabled={newExceptionIsClosed}
            onChange={(event) => setNewExceptionCloseTime(event.target.value)}
            className="gb-input"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Reason</span>
          <input
            type="text"
            value={newExceptionReason}
            onChange={(event) => setNewExceptionReason(event.target.value)}
            placeholder="Maintenance, private event, holiday..."
            className="gb-input"
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" className="gb-button" onClick={addException}>
            Add exception
          </button>
        </div>
      </div>

      {sortedExceptions.length > 0 ? (
        <div className="gb-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="gb-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedExceptions.map((exception) => (
                <tr key={exception.exceptionDate}>
                  <td>{exception.exceptionDate}</td>
                  <td>{exception.isClosed ? "Closed" : "Special hours"}</td>
                  <td>
                    {exception.isClosed
                      ? "Closed all day"
                      : `${exception.openTime} - ${exception.closeTime}`}
                  </td>
                  <td>{exception.reason || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="gb-button gb-button-small gb-button-secondary"
                      onClick={() => removeException(exception.exceptionDate)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="gb-muted-text">No exceptions added yet.</p>
      )}
    </section>
  );
}
