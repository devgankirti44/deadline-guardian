"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Radio, Layers, Crosshair, Brain, AlertOctagon,
  Archive, Shield, LogOut, HelpCircle, User, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const MODULES = [
  { id: "mission-control", path: "/mission-control", label: "Mission Control", icon: Radio },
  { id: "operations", path: "/operations", label: "Operations", icon: Layers },
  { id: "focus-room", path: "/focus-room", label: "Focus Room", icon: Crosshair },
  { id: "calendar", path: "/calendar", label: "Calendar", icon: Calendar }, // 📅 NEW
  { id: "intelligence", path: "/intelligence", label: "Intelligence", icon: Brain },
  { id: "crisis", path: "/crisis", label: "Crisis Center", icon: AlertOctagon },
  { id: "archive", path: "/archive", label: "Archive", icon: Archive },
];

export const MissionConsole = ({ alerts = {} }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  // Load user profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error("Profile parse error");
      }
    }
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("user_profile");
      if (stored) setProfile(JSON.parse(stored));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile-updated", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Session terminated");
    router.push("/");
  };

  const handleTour = () => {
    localStorage.removeItem("onboarded");
    toast.success("Starting tour...");
    window.location.reload();
  };

  const handlePersonalityTest = () => {
    localStorage.removeItem("profile_completed");
    localStorage.removeItem("profile_skipped");
    const event = new CustomEvent("take-personality-test");
    window.dispatchEvent(event);
    toast.success("Loading personality assessment...");
  };

  return (
    <aside
      className="flex flex-col h-screen"
      style={{
        width: "220px",
        background: "linear-gradient(180deg, #0A0A0A 0%, #060606 100%)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Subtle right glow border */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "1px",
          background: "linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.15) 50%, transparent 100%)",
        }}
      />

      {/* LOGO */}
      <div className="px-6 pt-8 pb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 relative"
            style={{
              background: "rgba(245,158,11,0.08)",
              borderRadius: "8px",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "8px",
                boxShadow: "0 0 20px rgba(245,158,11,0.3), inset 0 0 20px rgba(245,158,11,0.1)",
              }}
            />
            <Shield size={18} color="#F59E0B" style={{ position: "relative", zIndex: 1 }} />
          </div>
          <div>
            <div
              style={{
                color: "#F59E0B",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.2em",
                fontWeight: "600",
                lineHeight: "1.3",
              }}
            >
              DEADLINE
            </div>
            <div
              style={{
                color: "#F59E0B",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.2em",
                fontWeight: "600",
                lineHeight: "1.3",
              }}
            >
              GUARDIAN
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE BADGE (if completed) */}
      {profile && (
        <div className="px-4 pb-4">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              background: `linear-gradient(135deg, ${profile.profileColor}15 0%, transparent 100%)`,
              border: `1px solid ${profile.profileColor}40`,
              borderRadius: "10px",
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: profile.profileColor,
                boxShadow: `0 0 8px ${profile.profileColor}`,
              }}
            />
            <div className="flex-1 min-w-0">
              <div
                style={{
                  color: profile.profileColor,
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "0.15em",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                AI CALIBRATED
              </div>
              <div
                style={{
                  color: "#FAFAFA",
                  fontSize: "11px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile.profileType}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {MODULES.map((mod) => {
          const isActive = pathname === mod.path;
          const alertCount = alerts[mod.id] || 0;

          return (
            <button
              key={mod.id}
              onClick={() => router.push(mod.path)}
              className="w-full mb-1 flex items-center gap-3 transition-all relative group"
              style={{
                padding: "12px 16px",
                background: isActive ? "rgba(245,158,11,0.08)" : "transparent",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: "-16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "20px",
                    background: mod.id === "calendar" ? "#4285F4" : "#F59E0B",
                    borderRadius: "0 2px 2px 0",
                    boxShadow: mod.id === "calendar" 
                      ? "0 0 12px rgba(66,133,244,0.6)" 
                      : "0 0 12px rgba(245,158,11,0.6)",
                  }}
                />
              )}

              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "20px",
                  height: "20px",
                  color: isActive 
                    ? (mod.id === "calendar" ? "#4285F4" : "#F59E0B") 
                    : "#6B7280",
                  filter: isActive 
                    ? (mod.id === "calendar" 
                      ? "drop-shadow(0 0 6px rgba(66,133,244,0.5))" 
                      : "drop-shadow(0 0 6px rgba(245,158,11,0.5))") 
                    : "none",
                }}
              >
                <mod.icon size={16} />
              </div>

              <span
                style={{
                  color: isActive ? "#FAFAFA" : "#6B7280",
                  fontSize: "13px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: isActive ? "500" : "400",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {mod.label}
              </span>

              {alertCount > 0 && (
                <span
                  style={{
                    background: mod.id === "crisis" 
                      ? "#EF4444" 
                      : mod.id === "calendar" 
                        ? "rgba(66,133,244,0.2)" 
                        : "rgba(245,158,11,0.2)",
                    color: mod.id === "crisis" 
                      ? "#FFF" 
                      : mod.id === "calendar" 
                        ? "#4285F4" 
                        : "#FCD34D",
                    fontSize: "10px",
                    fontWeight: "600",
                    fontFamily: "JetBrains Mono, monospace",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ACTION BUTTONS */}
      <div className="px-4 pb-3 space-y-2">
        {/* PERSONALITY TEST */}
        <button
          onClick={handlePersonalityTest}
          className="w-full flex items-center gap-2 transition-all"
          style={{
            padding: "10px 14px",
            background: profile ? "transparent" : "linear-gradient(135deg, rgba(168,85,247,0.1), transparent)",
            border: `1px solid ${profile ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.3)"}`,
            borderRadius: "8px",
            color: profile ? "#6B7280" : "#A855F7",
            fontSize: "11px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(168,85,247,0.08)";
            e.currentTarget.style.color = "#A855F7";
            e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = profile ? "transparent" : "linear-gradient(135deg, rgba(168,85,247,0.1), transparent)";
            e.currentTarget.style.color = profile ? "#6B7280" : "#A855F7";
            e.currentTarget.style.borderColor = profile ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.3)";
          }}
        >
          <Brain size={13} />
          <span style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
            {profile ? "Retake Test" : "Take Big Five Test"}
          </span>
        </button>

        {/* TOUR BUTTON */}
        <button
          onClick={handleTour}
          className="w-full flex items-center gap-2 transition-all"
          style={{
            padding: "10px 14px",
            background: "transparent",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "8px",
            color: "#6B7280",
            fontSize: "11px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245,158,11,0.08)";
            e.currentTarget.style.color = "#F59E0B";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)";
          }}
        >
          <HelpCircle size={13} />
          <span style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
            Take Tour
          </span>
        </button>
      </div>

      {/* AI ONLINE STATUS */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "#10B981",
                boxShadow: "0 0 12px #10B981, 0 0 24px rgba(16,185,129,0.4)",
              }}
            />
            <div
              className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping"
              style={{ background: "#10B981", opacity: 0.4 }}
            />
          </div>
          <span
            style={{
              color: "#10B981",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.1em",
              fontWeight: "500",
            }}
          >
            AI Online
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-2 transition-all"
          style={{
            padding: "8px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#4B5563",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
          title="Logout"
        >
          <LogOut size={12} />
          <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};