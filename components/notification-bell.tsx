"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
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
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/notifications" 
      className="gb-nav-link" 
      style={{ 
        position: "relative", 
        display: "flex", 
        alignItems: "center",
        padding: "8px"
      }}
      aria-label="View notifications"
    >
      <span style={{ fontSize: "1.25rem" }}>🔔</span>
      
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "var(--gb-red, #e53e3e)",
            color: "white",
            borderRadius: "99px",
            fontSize: "10px",
            fontWeight: "bold",
            minWidth: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 0 0 2px var(--gb-bg, #000)",
            zIndex: 10
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
