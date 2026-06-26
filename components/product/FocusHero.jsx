"use client";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Play, 
  Check, 
  Clock, 
  AlertTriangle,
  Sparkles,
  ChevronRight 
} from "lucide-react";

export const FocusHero = ({ tasks, onComplete, onStartFocus, orchestratorData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Find the most critical/urgent task
  const activeTasks = tasks.filter(t => !t.completed);
  const sorted = [...activeTasks].sort((a, b) => {
    // Critical first
    if (a.riskLevel === "critical" && b.riskLevel !== "critical") return -1;
    if (b.riskLevel === "critical" && a.riskLevel !== "critical") return 1;
    // Then by deadline
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const topTask = sorted[0];

  if (!topTask) {
    return (
      <div
        className="rounded-lg p-12 text-center"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)",
          border: "1px solid #2A2A2A",
        }}
      >
        <div
          className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "2px solid #10B981",
            borderRadius: "50%",
          }}
        >
          <Check size={36} color="#10B981" />
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "#10B981" }}
        >
          All Clear! 🎉
        </h2>
        <p style={{ color: "#A3A3A3" }}>
          No missions pending. You're all caught up.
        </p>
      </div>
    );
  }

  // Calculate urgency
  const hoursLeft = topTask.deadline
    ? Math.round((new Date(topTask.deadline) - currentTime) / (1000 * 60 * 60))
    : null;

  const urgencyConfig = {
    critical: {
      bg: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(127,29,29,0.1) 100%)",
      border: "#EF4444",
      glow: "0 0 40px rgba(239,68,68,0.2)",
      label: "🚨 CRITICAL PRIORITY",
      color: "#EF4444",
    },
    high: {
      bg: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(180,83,9,0.08) 100%)",
      border: "#F59E0B",
      glow: "0 0 30px rgba(245,158,11,0.15)",
      label: "⚡ HIGH PRIORITY",
      color: "#F59E0B",
    },
    medium: {
      bg: "linear-gradient(135deg, rgba(252,211,77,0.08) 0%, rgba(146,64,14,0.05) 100%)",
      border: "#FCD34D",
      glow: "0 0 20px rgba(252,211,77,0.1)",
      label: "📌 ACTIVE MISSION",
      color: "#FCD34D",
    },
    low: {
      bg: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,78,59,0.05) 100%)",
      border: "#10B981",
      glow: "0 0 20px rgba(16,185,129,0.1)",
      label: "✓ NOMINAL",
      color: "#10B981",
    },
  };

  const cfg = urgencyConfig[topTask.riskLevel] || urgencyConfig.medium;

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <div
        className="rounded-lg p-8 relative overflow-hidden"
        style={{
          background: cfg.bg,
          border: `2px solid ${cfg.border}`,
          boxShadow: cfg.glow,
        }}
      >
        {/* Animated glow background */}
        {topTask.riskLevel === "critical" && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Priority Label */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              background: `${cfg.color}15`,
              border: `1px solid ${cfg.color}40`,
            }}
          >
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: cfg.color, fontFamily: "JetBrains Mono, monospace" }}
            >
              {cfg.label}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}
          >
            YOUR NEXT MISSION
          </span>
        </div>

        {/* Task Title */}
        <h1
          className="font-bold mb-3 leading-tight"
          style={{
            color: "#FAFAFA",
            fontSize: "32px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {topTask.title}
        </h1>

        {topTask.description && (
          <p
            className="mb-6"
            style={{ color: "#A3A3A3", fontSize: "15px", lineHeight: "1.6" }}
          >
            {topTask.description}
          </p>
        )}

        {/* Mission Stats */}
        <div className="flex items-center gap-6 mb-6">
          {hoursLeft !== null && (
            <div className="flex items-center gap-2">
              <Clock size={18} color={cfg.color} />
              <div>
                <div
                  className="text-xs"
                  style={{ color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}
                >
                  TIME LEFT
                </div>
                <div
                  className="font-bold"
                  style={{ color: cfg.color, fontSize: "18px" }}
                >
                  {hoursLeft <= 0
                    ? "OVERDUE"
                    : hoursLeft < 24
                    ? `${hoursLeft} hours`
                    : `${Math.floor(hoursLeft / 24)} days`}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Zap size={18} color={cfg.color} />
            <div>
              <div
                className="text-xs"
                style={{ color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}
              >
                ESTIMATED
              </div>
              <div className="font-bold" style={{ color: "#FAFAFA", fontSize: "18px" }}>
                {topTask.estimatedHours}h work
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle size={18} color={cfg.color} />
            <div>
              <div
                className="text-xs"
                style={{ color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}
              >
                RISK SCORE
              </div>
              <div className="font-bold" style={{ color: cfg.color, fontSize: "18px" }}>
                {topTask.riskScore || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onStartFocus(topTask)}
            className="flex items-center gap-2 px-6 py-3 font-bold transition-all hover:scale-105"
            style={{
              background: cfg.color,
              color: "#0D0D0D",
              borderRadius: "8px",
              fontSize: "14px",
              boxShadow: `0 4px 20px ${cfg.color}40`,
            }}
          >
            <Play size={16} fill="#0D0D0D" />
            START FOCUS SESSION
          </button>

          <button
            onClick={() => onComplete(topTask.id)}
            className="flex items-center gap-2 px-6 py-3 font-bold transition-all"
            style={{
              background: "transparent",
              color: "#10B981",
              border: "2px solid #10B981",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Check size={16} />
            MARK COMPLETE
          </button>
        </div>
      </div>

      {/* AI Advice Card */}
      {orchestratorData?.operatorAdvice && (
        <div
          className="rounded-lg p-5 flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(13,13,13,1) 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderLeft: "3px solid #F59E0B",
          }}
        >
          <div
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Sparkles size={14} color="#F59E0B" />
          </div>
          <div>
            <div
              className="text-xs font-bold mb-1 tracking-wider"
              style={{ color: "#F59E0B", fontFamily: "JetBrains Mono, monospace" }}
            >
              🤖 GUARDIAN AI ADVICE
            </div>
            <p style={{ color: "#E5E5E5", fontSize: "14px", lineHeight: "1.6" }}>
              {orchestratorData.operatorAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};