import Link from "next/link";
import T from "../../../components/t";
import LogoutButton from "../../../components/logout-button";

export default function PortalPendingPage() {
  return (
    <div className="portal-pending-page">
      <div className="portal-pending-card">
        <img
          src="/brand/logo-horizontal-ai.png"
          alt="GearBeat"
          className="portal-pending-logo"
        />
        
        <div className="portal-pending-status">
          <div className="status-badge">
            <T en="Under Review" ar="قيد المراجعة" />
          </div>
        </div>

        <h1>
          <T en="Account Pending Approval" ar="الحساب في انتظار الموافقة" />
        </h1>
        
        <p className="gb-muted-text">
          <T
            en="Your account is under review. You will be notified via email once approved."
            ar="حسابك قيد المراجعة. سيتم إخطارك عبر البريد الإلكتروني بمجرد الموافقة."
          />
        </p>

        <div className="portal-pending-actions">
          <LogoutButton />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-pending-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gb-bg);
          padding: 20px;
          text-align: center;
        }
        .portal-pending-card {
          width: 100%;
          max-width: 500px;
          padding: 48px;
          background: var(--gb-surface);
          border: 1px solid var(--gb-border);
          border-radius: 32px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        .portal-pending-logo {
          height: 40px;
          margin-bottom: 40px;
        }
        .portal-pending-status {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }
        .status-badge {
          display: inline-flex;
          padding: 6px 16px;
          background: rgba(214, 179, 92, 0.1);
          border: 1px solid var(--gb-gold);
          border-radius: 99px;
          color: var(--gb-gold);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .portal-pending-card h1 {
          font-size: 2rem;
          margin: 0 0 16px;
          color: var(--gb-text);
          line-height: 1.2;
        }
        .portal-pending-card p {
          font-size: 1.1rem;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .portal-pending-actions {
          display: flex;
          justify-content: center;
        }
        /* Override logout button style for this page */
        .portal-pending-actions .btn {
          min-height: 48px;
          padding: 0 32px;
          font-size: 1rem;
          font-weight: 700;
        }
      `}} />
    </div>
  );
}
