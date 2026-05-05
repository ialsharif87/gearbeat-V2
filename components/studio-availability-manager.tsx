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
    const savedRule = initialRules.find((rule) => rule.dayOfWeek === defaultRule.dayOfWeek);
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
  const [rules, setRules] = useState<AvailabilityRule[]>(normalizeRules(initialRules));
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(initialExceptions);

  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");
  const [newExceptionIsClosed, setNewExceptionIsClosed] = useState(true);
  const [newExceptionOpenTime, setNewExceptionOpenTime] = useState("09:00");
  const [newExceptionCloseTime, setNewExceptionCloseTime] = useState("18:00");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedExceptions = useMemo(() => {
    return [...exceptions].sort((a, b) => a.exceptionDate.localeCompare(b.exceptionDate));
  }, [exceptions]);

  function updateRule(dayOfWeek: number, key: keyof AvailabilityRule, value: any) {
    setRules((current) => current.map((rule) => (rule.dayOfWeek === dayOfWeek ? { ...rule, [key]: value } : rule)));
  }

  function addException() {
    setErrorMessage("");
    if (!newExceptionDate) {
      setErrorMessage("Select an exception date first.");
      return;
    }
    if (exceptions.some((e) => e.exceptionDate === newExceptionDate)) {
      setErrorMessage("This date already has an exception.");
      return;
    }
    setExceptions((curr) => [
      ...curr,
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
  }

  async function saveAvailability() {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");
    try {
      const res = await fetch("/api/portal/studios/availability/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studioId, rules, exceptions }),
      });
      if (!res.ok) throw new Error("Could not save availability.");
      setMessage("Availability saved successfully.");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '40px' }}>
      {/* Header & Save Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '24px 32px', borderRadius: '20px', border: '1px solid #222' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{studioName}</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
            <T en="Configure your weekly operating schedule." ar="قم بتهيئة جدول تشغيلك الأسبوعي." />
          </p>
        </div>
        <button className="gb-button" onClick={saveAvailability} disabled={isSaving}>
          {isSaving ? <T en="Saving..." ar="جاري الحفظ..." /> : <T en="Save Changes" ar="حفظ التغييرات" />}
        </button>
      </div>

      {message && <p style={{ color: '#22c55e', textAlign: 'center', fontWeight: 600 }}>{message}</p>}
      {errorMessage && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>{errorMessage}</p>}

      {/* Weekly Rules Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--gb-gold)', borderRadius: '2px' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            <T en="Weekly Schedule" ar="الجدول الأسبوعي" />
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {rules.map((rule) => {
            const dayLabel = days.find((d) => d.value === rule.dayOfWeek)?.label;
            return (
              <div key={rule.dayOfWeek} style={{ 
                background: rule.isOpen ? '#111' : '#0a0a0a', 
                border: '1px solid #1e1e1e', 
                borderRadius: '24px', 
                padding: '24px',
                opacity: rule.isOpen ? 1 : 0.6,
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{dayLabel}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{rule.isOpen ? <T en="Open" ar="مفتوح" /> : <T en="Closed" ar="مغلق" />}</span>
                    <input 
                      type="checkbox" 
                      checked={rule.isOpen} 
                      onChange={(e) => updateRule(rule.dayOfWeek, "isOpen", e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--gb-gold)' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}><T en="From" ar="من" /></label>
                    <input 
                      type="time" 
                      className="gb-input" 
                      value={rule.openTime} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "openTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}><T en="To" ar="إلى" /></label>
                    <input 
                      type="time" 
                      className="gb-input" 
                      value={rule.closeTime} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "closeTime", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}><T en="Slot (min)" ar="الفترة" /></label>
                    <input 
                      type="number" 
                      className="gb-input" 
                      value={rule.slotMinutes} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "slotMinutes", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}><T en="Buffer" ar="فاصل" /></label>
                    <input 
                      type="number" 
                      className="gb-input" 
                      value={rule.bufferMinutes} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "bufferMinutes", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exceptions Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '2px' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            <T en="Exceptions & Holidays" ar="الاستثناءات والعطلات" />
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* List of Exceptions */}
          <div style={{ background: '#111', borderRadius: '24px', border: '1px solid #1e1e1e', padding: '32px' }}>
            {sortedExceptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
                <T en="No exceptions scheduled." ar="لا توجد استثناءات مجدولة." />
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {sortedExceptions.map((ex) => (
                  <div key={ex.exceptionDate} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: '#0a0a0a', 
                    borderRadius: '16px', 
                    border: '1px solid #222' 
                  }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{ex.exceptionDate}</div>
                      <div style={{ fontSize: '0.85rem', color: ex.isClosed ? '#ef4444' : '#22c55e' }}>
                        {ex.isClosed ? <T en="Closed All Day" ar="مغلق طوال اليوم" /> : `${ex.openTime} - ${ex.closeTime}`}
                        {ex.reason && <span style={{ color: '#555', marginLeft: '8px' }}>• {ex.reason}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => setExceptions(curr => curr.filter(e => e.exceptionDate !== ex.exceptionDate))}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Exception Form */}
          <div style={{ background: '#111', borderRadius: '24px', border: '1px solid #1e1e1e', padding: '32px' }}>
            <h4 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}><T en="Add New Exception" ar="إضافة استثناء جديد" /></h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}><T en="Date" ar="التاريخ" /></label>
                <input type="date" className="gb-input" value={newExceptionDate} onChange={(e) => setNewExceptionDate(e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newExceptionIsClosed} onChange={(e) => setNewExceptionIsClosed(e.target.checked)} />
                <span style={{ fontSize: '0.9rem' }}><T en="Closed all day" ar="مغلق طوال اليوم" /></span>
              </label>
              {!newExceptionIsClosed && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}><T en="From" ar="من" /></label>
                    <input type="time" className="gb-input" value={newExceptionOpenTime} onChange={(e) => setNewExceptionOpenTime(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}><T en="To" ar="إلى" /></label>
                    <input type="time" className="gb-input" value={newExceptionCloseTime} onChange={(e) => setNewExceptionCloseTime(e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label style={labelStyle}><T en="Reason (optional)" ar="السبب (اختياري)" /></label>
                <input type="text" className="gb-input" value={newExceptionReason} onChange={(e) => setNewExceptionReason(e.target.value)} placeholder="..." />
              </div>
              <button className="gb-button" style={{ width: '100%' }} onClick={addException}>
                <T en="Add Exception" ar="إضافة" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: '#666',
  marginBottom: '4px',
  fontWeight: 600,
  textTransform: 'uppercase'
};
