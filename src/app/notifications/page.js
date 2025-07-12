"use client";
import { useState } from "react";

const mockNotifications = [
  {
    id: 1,
    title: "Swap Request Received",
    message: "You have a new swap request from Alice Johnson.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Swap Accepted",
    message: "Bob Smith accepted your swap request.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 3,
    title: "Feedback Received",
    message: "Clara Lee left feedback on your swap.",
    time: "Yesterday",
    read: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <main style={{ minHeight: "100vh", background: "#181f2a", padding: 40 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", background: "rgba(30,40,60,0.7)", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", border: "1px solid rgba(255,255,255,0.18)", padding: 32, backdropFilter: "blur(8px)" }}>
        <h1 style={{ color: "#00fff7", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Notifications</h1>
        {notifications.length === 0 ? (
          <div style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>No notifications.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.read ? "rgba(0,255,247,0.04)" : "rgba(0,255,247,0.12)",
                  borderRadius: 16,
                  padding: 20,
                  border: n.read ? "1.5px solid #222" : "1.5px solid #00fff7",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,255,247,0.08)",
                  opacity: n.read ? 0.7 : 1,
                  position: "relative",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: n.read ? "#fff" : "#00fff7" }}>{n.title}</div>
                <div style={{ fontSize: 15, margin: "8px 0" }}>{n.message}</div>
                <div style={{ fontSize: 13, color: "#00fff7" }}>{n.time}</div>
                <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8 }}>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "#00fff7",
                        color: "#222",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#ff4d4f",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 