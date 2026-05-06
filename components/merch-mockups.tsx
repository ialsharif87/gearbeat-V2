import React from 'react';
import T from './t';

export const QRStandMockup = ({ studioName, qrCodeUrl }: { studioName: string, qrCodeUrl?: string }) => {
  return (
    <div className="merch-mockup qr-stand">
      <div className="stand-body">
        <div className="stand-header">
          <div className="gb-logo gb-logo-sm">
            <span className="gb-logo-word">Gear<span>Beat</span></span>
          </div>
          <span className="certified-text">CERTIFIED STUDIO</span>
        </div>
        
        <div className="qr-container">
          <div className="qr-box">
             {/* Simple QR placeholder */}
             <div className="qr-pixel-grid">
               {Array.from({ length: 49 }).map((_, i) => (
                 <div key={i} className={`pixel ${Math.random() > 0.6 ? 'active' : ''}`} />
               ))}
             </div>
          </div>
        </div>

        <div className="stand-footer">
          <div className="studio-name">{studioName}</div>
          <div className="call-to-action">SCAN TO VERIFY & BOOK</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .qr-stand {
          width: 200px;
          height: 300px;
          background: #111;
          border: 4px solid #d4af37;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          color: #fff;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.1);
          font-family: sans-serif;
          position: relative;
        }

        .stand-header { text-align: center; margin-bottom: 20px; }
        .certified-text { font-size: 0.6rem; letter-spacing: 2px; color: #d4af37; font-weight: 800; }
        
        .qr-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          margin: 10px 0;
          padding: 10px;
        }

        .qr-box { width: 100px; height: 100px; }
        .qr-pixel-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; width: 100%; height: 100%; }
        .pixel { background: #eee; }
        .pixel.active { background: #000; }

        .stand-footer { text-align: center; margin-top: 10px; }
        .studio-name { font-weight: 800; font-size: 0.9rem; margin-bottom: 4px; color: #d4af37; }
        .call-to-action { font-size: 0.5rem; letter-spacing: 1px; color: #888; }
      `}} />
    </div>
  );
};

export const DoorStickerMockup = ({ tierLevel }: { tierLevel: number }) => {
  return (
    <div className={`merch-mockup door-sticker tier-${tierLevel}`}>
      <div className="sticker-content">
        <div className="gb-logo gb-logo-sm">
          <span className="gb-logo-word">Gear<span>Beat</span></span>
        </div>
        <div className="cert-label">CERTIFIED</div>
        <div className="year">2026</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .door-sticker {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: #000;
          border: 2px solid #d4af37;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          position: relative;
          color: #fff;
        }

        .cert-label { font-size: 0.7rem; font-weight: 800; letter-spacing: 3px; margin: 8px 0; }
        .year { font-size: 0.6rem; color: #d4af37; font-weight: 700; border-top: 1px solid #d4af37; padding-top: 4px; }

        .door-sticker.tier-5 {
           background: linear-gradient(135deg, #000 0%, #111 100%);
           border-width: 4px;
           box-shadow: 0 0 30px rgba(212,175,55,0.4);
        }
      `}} />
    </div>
  );
};
