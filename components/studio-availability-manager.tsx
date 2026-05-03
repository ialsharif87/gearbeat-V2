"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import T from "./t";

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
  { value: 0, label: <T en="Sunday" ar="الأحد" /> },
  { value: 1, label: <T en="Monday" ar="الاثنين" /> },
  { value: 2, label: <T en="Tuesday" ar="الثلاثاء" /> },
  { value: 3, label: <T en="Wednesday" ar="الأربعاء" /> },
  { value: 4, label: <T en="Thursday" ar="الخميس" /> },
  { value: 5, label: <T en="Friday" ar="الجمعة" /> },
  { value: 6, label: <T en="Saturday" ar="السبت" /> },
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
      const response = await fetch("/api/portal/studios/availability/update", {
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
          <p className="gb-eyebrow">
            <T en="Availability" ar="التوافر" />
          </p>
          <h2>{studioName}</h2>
          <p className="gb-muted-text">
            <T
              en="Manage working hours, closed days, booking slots, and special date exceptions for your studios."
              ar="أدر ساعات العمل والأيام المغلقة وفترات الحجز والاستثناءات الخاصة."
            />
          </p>
        </div>

        <button
          type="button"
          className="gb-button"
          onClick={saveAvailability}
          disabled={isSaving}
        >
          {isSaving ? (
            <T en="Saving..." ar="جاري الحفظ..." />
          ) : (
            <T en="Save availability" ar="حفظ التوافر" />
          )}
        </button>
      </div>

      {message ? <p className="gb-success-text">{message}</p> : null}
      {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

      <div className="gb-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="gb-table">
          <thead>
            <tr>
              <th>
                <T en="Day" ar="اليوم" />
              </th>
              <th>
                <T en="Open" ar="مفتوح" />
              </th>
              <th>
                <T en="Open time" ar="وقت الفتح" />
              </th>
              <th>
                <T en="Close time" ar="وقت الإغلاق" />
              </th>
              <th>
                <T en="Slot minutes" ar="مدة الفترة" />
              </th>
              <th>
                <T en="Buffer minutes" ar="وقت الفاصل" />
              </th>
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
          <p className="gb-eyebrow">
            <T en="Date exceptions" ar="استثناءات التواريخ" />
          </p>
          <h3>
            <T en="Closed dates or special hours" ar="تواريخ مغلقة أو ساعات خاصة" />
          </h3>
          <p className="gb-muted-text">
            <T
              en="Use this for holidays, private events, maintenance, or special working hours."
              ar="استخدم هذا للأجازات أو الفعاليات الخاصة أو الصيانة أو ساعات العمل الخاصة."
            />
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
          <span>
            <T en="Reason" ar="السبب" />
          </span>
          <input
            type="text"
            value={newExceptionReason}
            onChange={(event) => setNewExceptionReason(event.target.value)}
            placeholder="..."
            className="gb-input"
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" className="gb-button" onClick={addException}>
            <T en="Add exception" ar="إضافة استثناء" />
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
                  <td>
                    {exception.isClosed ? (
                      <T en="Closed" ar="مغلق" />
                    ) : (
                      <T en="Special hours" ar="ساعات خاصة" />
                    )}
                  </td>
                  <td>
                    {exception.isClosed ? (
                      <T en="Closed all day" ar="مغلق طوال اليوم" />
                    ) : (
                      `${exception.openTime} - ${exception.closeTime}`
                    )}
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
        <p className="gb-muted-text">
          <T en="No exceptions added yet" ar="لا توجد استثناءات بعد" />
        </p>
      )}
    </section>
  );
}
