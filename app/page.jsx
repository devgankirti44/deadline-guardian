"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, signInWithGoogle } from "@/lib/firebase";
import { Shield, AlertTriangle, Activity, Lock, Terminal, Zap } from "lucide-react";

const BootSequence = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const bootLines = [
    { text: "INITIALIZING DEADLINE GUARDIAN AI...", delay: 0 },
    { text: "LOADING GEMINI INTELLIGENCE CORE...", delay: 300 },
    { text: "CONNECTING TO MISSION DATABASE...", delay: 600 },
    { text: "RISK PREDICTION ENGINE: ONLINE", delay: 900 },
    { text: "CRISIS DETECTION SYSTEM: ACTIVE", delay: 1200 },
    { text: "FOCUS PULSE MONITOR: CALIBRATING...", delay: 1500 },
    { text: "ALL SYSTEMS NOMINAL", delay: 1800 },
    { text: "AWAITING OPERATOR AUTHENTICATION...", delay: 2100 },
  ];

  useEffect(() => {
    bootLines.forEach((line) => {
      setTimeout(() => {
        setLines((prev) => [...prev, line.text]);
      }, line.delay);
    });
    setTimeout(onComplete, 2500);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "#0D0D0D" }}
    >
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{ border: "1px solid #F59E0B" }}
          >
            <Shield size={20} color="#F59E0B" />
          </div>
          <div className="min-w-0">
            <div className="mono-xs font-bold tracking-widest truncate" style={{ color: "#F59E0B" }}>
              DEADLINE GUARDIAN AI
            </div>
            <div className="mono-xs truncate" style={{ color: "#4B5563" }}>
              MISSION CONTROL SYSTEM v2.0
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2 md:gap-3">
              <span style={{ color: "#10B981" }} className="mono-xs flex-shrink-0">
                ►
              </span>
              <span
                className="mono-xs break-words"
                style={{
                  color:
                    line.includes("ONLINE") ||
                    line.includes("ACTIVE") ||
                    line.includes("NOMINAL")
                      ? "#10B981"
                      : line.includes("AWAITING")
                      ? "#F59E0B"
                      : "#6B7280",
                }}
              >
                {line}
              </span>
              {i === lines.length - 1 && (
                <span className="animate-blink" style={{ color: "#F59E0B" }}>
                  █
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label, color = "#F59E0B" }) => (
  <div
    className="text-center p-2 md:p-4"
    style={{
      border: "1px solid #2A2A2A",
      background: "#141414",
    }}
  >
    <div className="big-number text-xl md:text-3xl font-bold mb-1" style={{ color }}>
      {value}
    </div>
    <div className="mono-xs" style={{ color: "#6B7280", fontSize: "9px" }}>{label}</div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        router.push("/mission-control");
      } else {
        setAuthChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { user, error } = await signInWithGoogle();
    if (error) {
      console.error(error);
    }
    if (user) {
      router.push("/mission-control");
    }
    setLoading(false);
  };

  if (authChecking) return null;

  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} />;
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col" style={{ background: "#0D0D0D" }}>
      {/* TOP STATUS BAR */}
      <div
        className="flex items-center justify-between px-3 md:px-6 py-2 gap-2"
        style={{
          background: "#0D0D0D",
          borderBottom: "1px solid #2A2A2A",
        }}
      >
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="status-dot status-dot-green" style={{ width: 8, height: 8 }} />
            <span className="mono-xs" style={{ color: "#6B7280" }}>ONLINE</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="status-dot status-dot-amber" style={{ width: 8, height: 8 }} />
            <span className="mono-xs" style={{ color: "#6B7280" }}>GEMINI CORE ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <span className="mono-xs font-bold" style={{ color: "#F59E0B" }}>
            {currentTime}
          </span>
          <span className="mono-xs hidden sm:inline" style={{ color: "#6B7280" }}>
            {new Date()
              .toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
              .toUpperCase()}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-6">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* LEFT CARD */}
            <div
              className="p-5 md:p-12 flex flex-col justify-between"
              style={{
                background: "#141414",
                border: "1px solid #2A2A2A",
              }}
            >
              <div>
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0"
                    style={{
                      border: "1px solid #F59E0B",
                      background: "rgba(245,158,11,0.08)",
                    }}
                  >
                    <Shield size={20} color="#F59E0B" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="font-bold tracking-widest"
                      style={{
                        color: "#F59E0B",
                        fontSize: "12px",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      DEADLINE GUARDIAN
                    </div>
                    <div className="mono-xs" style={{ color: "#4B5563" }}>
                      AI MISSION CONTROL
                    </div>
                  </div>
                </div>

                <h1
                  className="hero-title font-bold mb-3 md:mb-4 leading-tight"
                  style={{
                    fontSize: "clamp(20px, 5vw, 32px)",
                    color: "#E5E5E5",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Never Miss a{" "}
                  <span style={{ color: "#F59E0B" }}>Critical Deadline</span>{" "}
                  Again
                </h1>

                <p
                  className="mb-6 md:mb-8 leading-relaxed"
                  style={{
                    color: "#6B7280",
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  AI-powered mission control that predicts deadline
                  failures before they happen. Nine intelligent agents
                  working 24/7 to protect your commitments.
                </p>

                <div className="space-y-2 md:space-y-3">
                  {[
                    { icon: Activity, text: "Real-time deadline radar tracking" },
                    { icon: AlertTriangle, text: "AI risk prediction with probability scores" },
                    { icon: Zap, text: "Autonomous crisis detection & alerts" },
                    { icon: Terminal, text: "Gemini-powered command intelligence" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                        style={{
                          border: "1px solid #2A2A2A",
                          background: "#0D0D0D",
                        }}
                      >
                        <item.icon size={11} color="#F59E0B" />
                      </div>
                      <span className="mono-xs" style={{ color: "#A3A3A3" }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 md:mt-8">
                <StatCard value="9" label="AI AGENTS" color="#F59E0B" />
                <StatCard value="24/7" label="MONITORING" color="#10B981" />
                <StatCard value="0" label="MISSED" color="#EF4444" />
              </div>
            </div>

            {/* RIGHT CARD */}
            <div
              className="p-5 md:p-12 flex flex-col justify-center"
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderTop: "none",
              }}
            >
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={12} color="#F59E0B" />
                  <span className="mono-xs font-bold tracking-widest" style={{ color: "#F59E0B" }}>
                    OPERATOR AUTHENTICATION
                  </span>
                </div>
                <div
                  className="h-px w-full"
                  style={{
                    background: "linear-gradient(90deg, #F59E0B, transparent)",
                  }}
                />
              </div>

              <div
                className="p-3 mb-6"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderLeft: "3px solid #F59E0B",
                }}
              >
                <div className="mono-xs mb-1" style={{ color: "#6B7280" }}>SECURITY NOTICE</div>
                <div className="mono-xs" style={{ color: "#A3A3A3", lineHeight: 1.5 }}>
                  Access restricted to authorized operators. Authentication via Google Secure OAuth 2.0.
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 mb-4 transition-all"
                style={{
                  background: loading ? "#1A1A1A" : "rgba(245,158,11,0.1)",
                  border: "1px solid #F59E0B",
                  color: "#F59E0B",
                  padding: "14px 24px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  cursor: loading ? "not-allowed" : "pointer",
                  borderRadius: "2px",
                  minHeight: "48px",
                }}
              >
                {loading ? (
                  <>
                    <div className="guardian-loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#F59E0B"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#D97706"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#B45309"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#92400E"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    AUTHENTICATE WITH GOOGLE
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "#2A2A2A" }} />
                <span className="mono-xs" style={{ color: "#6B7280" }}>SYSTEM INFO</span>
                <div className="flex-1 h-px" style={{ background: "#2A2A2A" }} />
              </div>

              <div className="space-y-2">
                {[
                  { label: "AI ENGINE", value: "GEMINI 2.5 FLASH", color: "#10B981" },
                  { label: "DATABASE", value: "FIRESTORE", color: "#10B981" },
                  { label: "AGENTS", value: "9 ACTIVE", color: "#F59E0B" },
                  { label: "STATUS", value: "ALL SYSTEMS GO", color: "#10B981" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1 gap-2"
                    style={{ borderBottom: "1px solid #1A1A1A" }}
                  >
                    <span className="mono-xs flex-shrink-0" style={{ color: "#6B7280" }}>{item.label}</span>
                    <span className="mono-xs font-bold text-right" style={{ color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="mono-xs text-center" style={{ color: "#6B7280" }}>
                  Powered by Google AI Studio & Gemini API
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div
        className="ticker-wrap py-1.5"
        style={{
          background: "#0D0D0D",
          borderTop: "1px solid #2A2A2A",
        }}
      >
        <span className="ticker-content">
          DEADLINE GUARDIAN AI // MISSION CONTROL ACTIVE ◆ GEMINI
          INTELLIGENCE CORE ONLINE ◆ 9 AI AGENTS DEPLOYED ◆
          PROTECTING YOUR DEADLINES 24/7 ◆ NEVER MISS A CRITICAL
          DEADLINE AGAIN ◆ POWERED BY GOOGLE AI STUDIO ◆
        </span>
      </div>
    </div>
  );
}