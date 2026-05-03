"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PortalNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/notifications" 
      className="portal-nav-link"
      style={{ 
        position: "relative", 
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "8px 12px",
        marginBottom: "8px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.03)"
      }}
    >
      <span className="icon" style={{ fontSize: "1.2rem", marginRight: 0 }}>🔔</span>
      
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "var(--gb-gold, #cfaf62)",
            color: "var(--gb-dark, #000)",
            borderRadius: "99px",
            fontSize: "10px",
            fontWeight: "bold",
            minWidth: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 0 0 2px var(--portal-bg, #0a0a0a)",
            zIndex: 10
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
