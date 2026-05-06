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
          background: var(--gb-card);
          border: 1px solid var(--gb-border);
          border-radius: 32px;
          box-shadow: var(--shadow-premium);
        }
        .portal-pending-logo {
          height: 40px;
          margin-bottom: 40px;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.2));
        }
        .portal-pending-status {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }
        .status-badge {
          display: inline-flex;
          padding: 8px 20px;
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid var(--gb-gold);
          border-radius: 99px;
          color: var(--gb-gold);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .portal-pending-card h1 {
          font-size: 2rem;
          margin: 0 0 16px;
          color: var(--gb-text);
          line-height: 1.2;
          font-weight: 800;
        }
        .portal-pending-card p {
          font-size: 1rem;
          color: var(--gb-text-muted);
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
          font-weight: 800;
          background: var(--gb-gold);
          color: #000;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition);
        }
        .portal-pending-actions .btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-gold);
        }
      `}} />
    </div>
  );
}
