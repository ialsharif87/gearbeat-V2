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
  pricePerHour: number;
};

type AvailabilityException = {
  id?: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
  pricePerHour?: number | null;
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
    pricePerHour: 0,
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

  const [newExceptionStartDate, setNewExceptionStartDate] = useState("");
  const [newExceptionEndDate, setNewExceptionEndDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");
  const [newExceptionIsClosed, setNewExceptionIsClosed] = useState(true);
  const [newExceptionOpenTime, setNewExceptionOpenTime] = useState("09:00");
  const [newExceptionCloseTime, setNewExceptionCloseTime] = useState("18:00");
  const [newExceptionPrice, setNewExceptionPrice] = useState<number | "">("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedExceptions = useMemo(() => {
    return [...exceptions].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [exceptions]);

  function updateRule(dayOfWeek: number, key: keyof AvailabilityRule, value: any) {
    setRules((current) => current.map((rule) => (rule.dayOfWeek === dayOfWeek ? { ...rule, [key]: value } : rule)));
  }

  function addException() {
    setErrorMessage("");
    if (!newExceptionStartDate) {
      setErrorMessage("Select a start date first.");
      return;
    }
    const endDate = newExceptionEndDate || newExceptionStartDate;
    if (exceptions.some((e) => e.startDate === newExceptionStartDate)) {
      setErrorMessage("This start date already has an exception.");
      return;
    }
    setExceptions((curr) => [
      ...curr,
      {
        startDate: newExceptionStartDate,
        endDate: endDate,
        isClosed: newExceptionIsClosed,
        openTime: newExceptionOpenTime,
        closeTime: newExceptionCloseTime,
        reason: newExceptionReason,
        pricePerHour: newExceptionPrice === "" ? null : Number(newExceptionPrice),
      },
    ]);
    setNewExceptionStartDate("");
    setNewExceptionEndDate("");
    setNewExceptionReason("");
    setNewExceptionPrice("");
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
    <div className="gb-dashboard-stack" style={{ gap: '40px' }}>
      {/* Header & Save Action */}
      <div className="gb-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{studioName}</h2>
          <p className="gb-muted-text" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
            <T en="Configure your weekly operating schedule." ar="قم بتهيئة جدول تشغيلك الأسبوعي." />
          </p>
        </div>
        <button 
          className={`gb-button ${isSaving ? 'gb-button-outline' : 'gb-button-primary'}`} 
          onClick={saveAvailability} 
          disabled={isSaving}
          style={{ minWidth: '160px', justifyContent: 'center' }}
        >
          {isSaving ? <T en="Saving..." ar="جاري الحفظ..." /> : <T en="Save Changes" ar="حفظ التغييرات" />}
        </button>
      </div>

      {message && (
        <div className="gb-card" style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', textAlign: 'center', fontWeight: 600 }}>
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="gb-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
          {errorMessage}
        </div>
      )}

      {/* Weekly Rules Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--gb-gold)', borderRadius: '2px' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            <T en="Weekly Schedule" ar="الجدول الأسبوعي" />
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {rules.map((rule) => {
            const dayLabel = days.find((d) => d.value === rule.dayOfWeek)?.label;
            return (
              <div key={rule.dayOfWeek} className="gb-card" style={{ 
                padding: '24px',
                opacity: rule.isOpen ? 1 : 0.6,
                transition: 'all 0.3s',
                borderTop: rule.isOpen ? '4px solid var(--gb-gold)' : '1px solid var(--gb-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{dayLabel}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: rule.isOpen ? 'var(--gb-gold)' : 'var(--gb-text-muted)' }}>
                      {rule.isOpen ? <T en="OPEN" ar="مفتوح" /> : <T en="CLOSED" ar="مغلق" />}
                    </span>
                    <div className="gb-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={rule.isOpen} 
                        onChange={(e) => updateRule(rule.dayOfWeek, "isOpen", e.target.checked)}
                        style={{ width: '22px', height: '22px', accentColor: 'var(--gb-gold)', cursor: 'pointer' }}
                      />
                    </div>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="From" ar="من" /></label>
                    <input 
                      type="time" 
                      className="gb-input" 
                      value={rule.openTime} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "openTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="To" ar="إلى" /></label>
                    <input 
                      type="time" 
                      className="gb-input" 
                      value={rule.closeTime} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "closeTime", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="Slot (min)" ar="الفترة" /></label>
                    <input 
                      type="number" 
                      className="gb-input" 
                      value={rule.slotMinutes} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "slotMinutes", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="Buffer (min)" ar="الفاصل" /></label>
                    <input 
                      type="number" 
                      className="gb-input" 
                      value={rule.bufferMinutes} 
                      disabled={!rule.isOpen}
                      onChange={(e) => updateRule(rule.dayOfWeek, "bufferMinutes", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="Price (SAR/hr)" ar="السعر (ساعة)" /></label>
                  <input 
                    type="number" 
                    className="gb-input" 
                    value={rule.pricePerHour} 
                    disabled={!rule.isOpen}
                    onChange={(e) => updateRule(rule.dayOfWeek, "pricePerHour", Number(e.target.value))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exceptions Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--gb-teal)', borderRadius: '2px' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            <T en="Exceptions & Holidays" ar="الاستثناءات والعطلات" />
          </h3>
        </div>

        <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* List of Exceptions */}
          <div className="gb-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="gb-card-header" style={{ padding: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 800 }}>
                <T en="Scheduled Exceptions" ar="الاستثناءات المجدولة" />
              </h4>
            </div>
            
            <div style={{ padding: '24px' }}>
              {sortedExceptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.2 }}>🗓️</div>
                  <p className="gb-muted-text">
                    <T en="No exceptions scheduled." ar="لا توجد استثناءات مجدولة." />
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {sortedExceptions.map((ex) => (
                    <div key={ex.startDate} className="gb-card" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '20px', 
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--gb-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', background: ex.isClosed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 160, 138, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          {ex.isClosed ? '🚫' : '⏰'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, color: 'white', fontSize: '1.1rem' }}>
                            {ex.startDate === ex.endDate ? ex.startDate : `${ex.startDate} → ${ex.endDate}`}
                          </div>
                          <div style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 700, color: ex.isClosed ? '#ef4444' : 'var(--gb-teal)' }}>
                            {ex.isClosed ? <T en="Closed" ar="مغلق" /> : `${ex.openTime} - ${ex.closeTime}`}
                            {ex.pricePerHour && <span style={{ color: 'var(--gb-gold)', marginLeft: '12px' }}>• {ex.pricePerHour} SAR/hr</span>}
                            {ex.reason && <span style={{ color: 'var(--gb-text-muted)', marginLeft: '12px' }}>• {ex.reason}</span>}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setExceptions(curr => curr.filter(e => e.startDate !== ex.startDate))}
                        className="gb-button gb-button-outline"
                        style={{ border: 'none', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 16px' }}
                      >
                        <T en="Remove" ar="إزالة" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Exception Form */}
          <div className="gb-card" style={{ padding: '32px', position: 'sticky', top: '24px' }}>
            <h4 style={{ margin: '0 0 24px', fontSize: '1.25rem', color: 'white', fontWeight: 800 }}>
              <T en="Add New Exception" ar="إضافة استثناء جديد" />
            </h4>
            
            <div className="gb-dashboard-stack" style={{ gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="From Date" ar="من تاريخ" /></label>
                  <input type="date" className="gb-input" value={newExceptionStartDate} onChange={(e) => setNewExceptionStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="To Date (optional)" ar="إلى تاريخ (اختياري)" /></label>
                  <input type="date" className="gb-input" value={newExceptionEndDate} onChange={(e) => setNewExceptionEndDate(e.target.value)} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--gb-border)' }}>
                <input 
                  type="checkbox" 
                  checked={newExceptionIsClosed} 
                  onChange={(e) => setNewExceptionIsClosed(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--gb-teal)' }}
                />
                <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 700 }}>
                  <T en="Closed all day" ar="مغلق طوال اليوم" />
                </span>
              </label>

              {!newExceptionIsClosed && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="From" ar="من" /></label>
                    <input type="time" className="gb-input" value={newExceptionOpenTime} onChange={(e) => setNewExceptionOpenTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="To" ar="إلى" /></label>
                    <input type="time" className="gb-input" value={newExceptionCloseTime} onChange={(e) => setNewExceptionCloseTime(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="Price Override (optional)" ar="تعديل السعر (اختياري)" /></label>
                <input 
                  type="number" 
                  className="gb-input" 
                  value={newExceptionPrice} 
                  onChange={(e) => setNewExceptionPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                  placeholder="SAR/hr" 
                />
              </div>

              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}><T en="Reason / Label" ar="السبب / التسمية" /></label>
                <input 
                  type="text" 
                  className="gb-input" 
                  value={newExceptionReason} 
                  onChange={(e) => setNewExceptionReason(e.target.value)} 
                  placeholder={newExceptionIsClosed ? "e.g. Maintenance" : "e.g. Weekend Special"} 
                />
              </div>

              <button 
                className="gb-button gb-button-primary" 
                style={{ width: '100%', justifyContent: 'center', height: '54px', fontSize: '1rem' }} 
                onClick={addException}
              >
                <T en="Add to Schedule" ar="إضافة للجدول" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
