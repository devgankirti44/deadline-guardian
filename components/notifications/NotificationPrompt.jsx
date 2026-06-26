"use client";
import { useState, useEffect } from "react";
import { Bell, X, Shield, Zap, AlertOctagon } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications();

  useEffect(() => {
    if (!isSupported) return;
    
    // Show prompt after 5 seconds if not asked yet
    const seen = localStorage.getItem("notification-prompt-seen");
    if (permission === "default" && !seen) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    localStorage.setItem("notification-prompt-seen", "true");
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("notification-prompt-seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm"
      style={{
        animation: "slideUp 0.4s ease-out",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 transition-colors"
          style={{
            background: "transparent",
            border: "none",
            color: "#6B7280",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: "44px",
              height: "44px",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid #F59E0B",
              borderRadius: "12px",
            }}
          >
            <Bell size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={{
              color: "#F59E0B",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "4px",
            }}>
              ENABLE ALWAYS WATCHING
            </div>
            <h3 style={{
              color: "#FAFAFA",
              fontSize: "16px",
              fontWeight: "600",
              lineHeight: "1.3",
            }}>
              Let me alert you before failures
            </h3>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: "#A3A3A3", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
          I'll watch your missions 24/7 and send you alerts when:
        </p>

        {/* Feature list */}
        <div className="space-y-2 mb-5">
          {[
            { icon: AlertOctagon, color: "#EF4444", text: "Critical deadlines approach" },
            { icon: Zap, color: "#F59E0B", text: "Optimal focus windows open" },
            { icon: Shield, color: "#10B981", text: "Cognitive overload detected" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon size={12} color={item.color} />
              <span style={{ color: "#E5E5E5", fontSize: "12px" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#6B7280",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            style={{
              flex: 2,
              padding: "10px 16px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              border: "none",
              borderRadius: "8px",
              color: "#0D0D0D",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "0.05em",
              fontFamily: "JetBrains Mono, monospace",
              boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
            }}
          >
            ENABLE ALERTS
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}