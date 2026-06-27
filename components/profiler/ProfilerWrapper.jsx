"use client";
import { useState, useEffect } from "react";
import { onAuthChange } from "@/lib/firebase";
import PersonalityProfiler from "./PersonalityProfiler";
import { Brain, ArrowRight, X, Sparkles } from "lucide-react";

export default function ProfilerWrapper() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) {
        setUser(u);
        
        // ✅ Check BOTH completion AND skip status
        const completed = localStorage.getItem("profile_completed");
        const skipped = localStorage.getItem("profile_skipped");
        const skipTimestamp = localStorage.getItem("profile_skipped_at");
        
        // ✅ If completed → never show
        if (completed) {
          console.log("✅ Profile completed - won't show");
          return;
        }
        
        // ✅ If skipped recently (within 24 hours) → don't show
        if (skipped && skipTimestamp) {
          const hoursSinceSkip = (Date.now() - parseInt(skipTimestamp)) / (1000 * 60 * 60);
          if (hoursSinceSkip < 24) {
            console.log(`⏳ Profile skipped ${Math.round(hoursSinceSkip)}h ago - won't show again for 24h`);
            return;
          }
        }
        
        // Otherwise, show welcome screen after slight delay
        console.log("📋 Showing profile welcome screen");
        setTimeout(() => setShowWelcome(true), 1500);
      }
    });
    return () => unsub();
  }, []);

  // Listen for "take test" event from sidebar
  useEffect(() => {
    const handleTakeTest = () => {
      setShowWelcome(false);
      setShowProfiler(true);
    };
    window.addEventListener("take-personality-test", handleTakeTest);
    return () => window.removeEventListener("take-personality-test", handleTakeTest);
  }, []);

  const handleStartTest = () => {
    setShowWelcome(false);
    setShowProfiler(true);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    // ✅ Save skip with timestamp
    localStorage.setItem("profile_skipped", "true");
    localStorage.setItem("profile_skipped_at", Date.now().toString());
    console.log("⏭️ Profile skipped - won't show for 24 hours");
  };

  const handleComplete = (profile) => {
    setShowProfiler(false);
    // ✅ Mark as completed (don't show again ever)
    localStorage.setItem("profile_completed", "true");
    localStorage.setItem("profile_completed_at", Date.now().toString());
    if (profile) {
      localStorage.setItem("user_profile", JSON.stringify(profile));
    }
    console.log("✅ Profile completed and saved");
  };

  // ─── WELCOME SCREEN ──────────────────────────
  if (showWelcome) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{
          background: "rgba(0,0,0,0.97)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-8 right-8 flex items-center gap-2 transition-colors"
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            color: "#6B7280",
            fontSize: "12px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
        >
          Skip for now
          <X size={12} />
        </button>

        <div className="w-full max-w-2xl text-center">
          {/* Animated Brain Icon */}
          <div className="mb-8 flex justify-center">
            <div
              className="relative"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="absolute inset-0 animate-ping"
                style={{
                  borderRadius: "50%",
                  background: "rgba(168,85,247,0.15)",
                  animationDuration: "2s",
                }}
              />
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, rgba(168,85,247,0.2), transparent)",
                  border: "2px solid #A855F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 60px rgba(168,85,247,0.4)",
                }}
              >
                <Brain size={48} color="#A855F7" />
              </div>
            </div>
          </div>

          {/* Eyebrow */}
          <div
            className="mb-3"
            style={{
              color: "#A855F7",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.3em",
              fontWeight: "600",
            }}
          >
            BEFORE WE BEGIN
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#FAFAFA",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: "1.1",
              marginBottom: "20px",
            }}
          >
            Let me <span style={{ color: "#A855F7" }}>understand you</span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "17px",
              color: "#A3A3A3",
              lineHeight: "1.6",
              maxWidth: "540px",
              margin: "0 auto 32px",
            }}
          >
            Most productivity apps treat everyone the same. I won't.
            <br />
            Take a 2-minute scientific Big Five (OCEAN) personality assessment
            so I can calibrate my 8 AI agents to YOUR behavior.
          </p>

          {/* What you get */}
          <div
            className="mb-8 p-5 max-w-lg mx-auto text-left"
            style={{
              background: "rgba(168,85,247,0.05)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                color: "#A855F7",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "12px",
              }}
            >
              ⚡ WHAT YOU GET
            </div>

            <div className="space-y-2.5">
              {[
                { icon: "🎯", text: "Personalized time estimates based on your reliability" },
                { icon: "🧠", text: "AI nudges matched to your stress response" },
                { icon: "📊", text: "Predictions about which tasks you'll likely complete" },
                { icon: "🎨", text: "Intervention style tuned to your personality" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span style={{ color: "#E5E5E5", fontSize: "13px", lineHeight: "1.5" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Credibility */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <Sparkles size={12} color="#6B7280" />
            <span style={{ color: "#6B7280", fontSize: "12px" }}>
              Same Big Five model used by NASA, FBI, and Fortune 500 companies
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSkip}
              className="transition-all"
              style={{
                padding: "14px 28px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "100px",
                color: "#A3A3A3",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#A3A3A3";
              }}
            >
              Skip for now
            </button>

            <button
              onClick={handleStartTest}
              className="inline-flex items-center gap-3"
              style={{
                padding: "14px 32px",
                background: "#A855F7",
                border: "none",
                borderRadius: "100px",
                color: "#0D0D0D",
                fontSize: "14px",
                fontWeight: "700",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.1em",
                cursor: "pointer",
                boxShadow: "0 4px 30px rgba(168,85,247,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(168,85,247,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 30px rgba(168,85,247,0.4)";
              }}
            >
              START ASSESSMENT
              <ArrowRight size={16} />
            </button>
          </div>

          <p
            style={{
              marginTop: "20px",
              color: "#4B5563",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Takes 2 minutes · 15 questions · Can retake anytime
          </p>
        </div>
      </div>
    );
  }

  // ─── ACTUAL PROFILER ──────────────────────────
  if (showProfiler && user) {
    return <PersonalityProfiler onComplete={handleComplete} />;
  }

  return null;
}