"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Radio, Layers, Crosshair, Brain, AlertOctagon,
  Archive, ChevronRight, ChevronLeft, X, Sparkles, ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    title: "Welcome to Deadline Guardian",
    subtitle: "Your AI-powered deadline prevention system",
    icon: Shield,
    color: "#F59E0B",
    description: "I'm not a task manager. I'm an intelligent system that actively prevents you from missing deadlines. Let me show you how I work.",
    visual: "logo",
  },
  {
    title: "Mission Control",
    subtitle: "Your situation overview",
    icon: Radio,
    color: "#F59E0B",
    description: "Real-time AI briefing on what's at risk, what needs immediate action, and what I recommend you do next.",
    feature: "AI Situation Report · Threat Level · Critical Actions · Recommendations",
    visual: "page",
  },
  {
    title: "Operations Center",
    subtitle: "Manage your missions",
    icon: Layers,
    color: "#FCD34D",
    description: "Add missions using natural language. View them in the Eisenhower priority matrix. Filter, sort, and execute with AI assistance.",
    feature: "Natural Language Input · Priority Matrix · AI Breakdown · Smart Filters",
    visual: "page",
  },
  {
    title: "Focus Room",
    subtitle: "Deep work environment",
    icon: Crosshair,
    color: "#10B981",
    description: "Pick a mission, enter the zone. 25-minute Pomodoro sessions with automatic breaks. AI Focus Coach guides you.",
    feature: "Pomodoro Timer · AI Focus Coach · Session Tracking · Break Management",
    visual: "page",
  },
  {
    title: "Intelligence Center",
    subtitle: "AI behavioral analysis",
    icon: Brain,
    color: "#34D399",
    description: "Discover your productivity patterns. See completion trends, peak hours, and AI-generated insights about your work habits.",
    feature: "Behavioral Insights · Productivity Charts · Peak Hours · Performance Trends",
    visual: "page",
  },
  {
    title: "Crisis Center",
    subtitle: "Emergency intervention",
    icon: AlertOctagon,
    color: "#EF4444",
    description: "When deadlines are at risk, I generate AI recovery plans with success probability. Three strategies per crisis: aggressive, balanced, or safe.",
    feature: "Failure Prediction · Recovery Plans · Conflict Detection · Strategy Selection",
    visual: "page",
  },
  {
    title: "Mission Archive",
    subtitle: "Your accomplishments",
    icon: Archive,
    color: "#6B7280",
    description: "Review completed missions, unlock achievements, and reflect on your journey with AI-generated retrospectives.",
    feature: "9 Achievements · Mission History · AI Retrospective · Streak Tracking",
    visual: "page",
  },
  {
    title: "You're ready, Operator",
    subtitle: "Let's protect your deadlines",
    icon: Sparkles,
    color: "#F59E0B",
    description: "I'm always watching. I'll predict failures before they happen, recommend actions, and intervene when you need help. Your job: execute.",
    cta: "Enter Mission Control",
    visual: "ready",
  },
];

export default function Onboarding({ onComplete }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("onboarded", "true");
    setVisible(false);
    setTimeout(() => {
      onComplete();
      router.push("/mission-control");
    }, 300);
  };

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{
        background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(20px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
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
        Skip Tour
        <X size={12} />
      </button>

      {/* Progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? "24px" : "6px",
              height: "6px",
              borderRadius: "100px",
              background: i === step ? current.color : i < step ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="absolute top-8 left-8" style={{
        color: "#6B7280",
        fontSize: "11px",
        fontFamily: "JetBrains Mono, monospace",
        letterSpacing: "0.2em",
      }}>
        {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl text-center">
        
        {/* Visual */}
        <div className="mb-8 flex justify-center">
          {current.visual === "logo" ? (
            <div className="relative">
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${current.color}30 0%, transparent 70%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  className="absolute inset-0 animate-ping"
                  style={{
                    borderRadius: "50%",
                    background: `${current.color}10`,
                    animationDuration: "3s",
                  }}
                />
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "20px",
                    background: `linear-gradient(135deg, ${current.color}20, transparent)`,
                    border: `2px solid ${current.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 60px ${current.color}40`,
                  }}
                >
                  <current.icon size={48} color={current.color} />
                </div>
              </div>
            </div>
          ) : current.visual === "ready" ? (
            <div className="relative">
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${current.color}40 0%, transparent 70%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={64} color={current.color} style={{ filter: `drop-shadow(0 0 20px ${current.color})` }} />
              </div>
            </div>
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "24px",
                background: `linear-gradient(135deg, ${current.color}15, transparent)`,
                border: `1px solid ${current.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${current.color}20`,
              }}
            >
              <current.icon size={56} color={current.color} />
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div
          className="mb-3"
          style={{
            color: current.color,
            fontSize: "12px",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.3em",
            fontWeight: "600",
          }}
        >
          {current.subtitle.toUpperCase()}
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
          {current.title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "17px",
            color: "#A3A3A3",
            lineHeight: "1.6",
            maxWidth: "560px",
            margin: "0 auto 24px",
          }}
        >
          {current.description}
        </p>

        {/* Features */}
        {current.feature && (
          <div
            className="inline-flex"
            style={{
              padding: "10px 20px",
              background: `${current.color}08`,
              border: `1px solid ${current.color}25`,
              borderRadius: "100px",
              marginBottom: "40px",
            }}
          >
            <span style={{
              color: current.color,
              fontSize: "12px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.1em",
            }}>
              {current.feature}
            </span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 transition-all"
              style={{
                padding: "12px 24px",
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
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-3 transition-all"
            style={{
              padding: "14px 32px",
              background: current.color,
              border: "none",
              borderRadius: "100px",
              color: "#0D0D0D",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: `0 4px 30px ${current.color}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 40px ${current.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 30px ${current.color}40`;
            }}
          >
            {step === STEPS.length - 1 ? current.cta : "Continue"}
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full"
              style={{ background: "rgba(13,13,13,0.2)" }}
            >
              <ArrowRight size={14} />
            </div>
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <kbd
              style={{
                padding: "2px 8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                color: "#6B7280",
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ←
            </kbd>
            <kbd
              style={{
                padding: "2px 8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                color: "#6B7280",
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              →
            </kbd>
            <span style={{ color: "#4B5563", fontSize: "11px" }}>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd
              style={{
                padding: "2px 8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                color: "#6B7280",
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ESC
            </kbd>
            <span style={{ color: "#4B5563", fontSize: "11px" }}>Skip</span>
          </div>
        </div>
      </div>
    </div>
  );
}