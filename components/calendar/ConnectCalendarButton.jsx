"use client";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Calendar, Check, Loader2, Link2Off } from "lucide-react";
import { useState } from "react";

export default function ConnectCalendarButton({ userId, variant = "default" }) {
  const { isConnected, checkingConnection, connect, disconnect } = useGoogleCalendar(userId);
  const [showDisconnect, setShowDisconnect] = useState(false);

  if (checkingConnection) {
    return (
      <div className="flex items-center gap-2 px-4 py-2" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
        <Loader2 size={14} className="animate-spin" color="#6B7280" />
        <span style={{ color: "#6B7280", fontSize: "12px" }}>Checking...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDisconnect(!showDisconnect)}
          className="flex items-center gap-2 transition-all"
          style={{
            padding: "8px 14px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "8px",
            color: "#10B981",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          <Check size={14} />
          GOOGLE CALENDAR CONNECTED
        </button>
        
        {showDisconnect && (
          <div
            className="absolute top-full mt-2 right-0 z-50"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "12px",
              minWidth: "220px",
            }}
          >
            <p style={{ color: "#A3A3A3", fontSize: "12px", marginBottom: "10px" }}>
              Disconnect Google Calendar?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  disconnect();
                  setShowDisconnect(false);
                }}
                style={{
                  padding: "6px 12px",
                  background: "#EF4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                <Link2Off size={11} className="inline mr-1" />
                Disconnect
              </button>
              <button
                onClick={() => setShowDisconnect(false)}
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  color: "#A3A3A3",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 transition-all"
      style={{
        padding: "10px 18px",
        background: "linear-gradient(135deg, #4285F4, #1A73E8)",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 4px 12px rgba(66,133,244,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(66,133,244,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(66,133,244,0.3)";
      }}
    >
      <Calendar size={14} />
      Connect Google Calendar
    </button>
  );
}