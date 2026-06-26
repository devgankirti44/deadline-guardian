"use client";
import { Brain, Zap, Eye } from "lucide-react";

const EnergyBar = ({ value, max = 100, color }) => (
  <div className="progress-bar-amber">
    <div
      className="progress-bar-amber-fill"
      style={{
        width: `${(value / max) * 100}%`,
        background: `linear-gradient(90deg, ${color}66, ${color})`,
      }}
    />
  </div>
);

const StateColors = {
  deep_work: { color: "#10B981", label: "DEEP WORK" },
  shallow: { color: "#F59E0B", label: "SHALLOW WORK" },
  distracted: { color: "#EF4444", label: "DISTRACTED" },
  burnt_out: { color: "#7F1D1D", label: "BURNT OUT" },
  peak: { color: "#34D399", label: "PEAK PERFORMANCE" },
};

export const FocusPulse = ({ focusData = null }) => {
  const state = focusData?.focusState || "shallow";
  const stateCfg = StateColors[state] || StateColors.shallow;
  const score = focusData?.focusScore || 50;
  const energy = focusData?.energyLevel || "medium";

  const energyColors = {
    high: "#10B981",
    medium: "#F59E0B",
    low: "#EF4444",
    depleted: "#7F1D1D",
  };

  const energyColor = energyColors[energy] || "#F59E0B";

  return (
    <div className="guardian-panel h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Brain size={12} color="#F59E0B" />
          <span className="panel-title">FOCUS PULSE</span>
        </div>
        <span
          className="mono-xs font-bold"
          style={{ color: stateCfg.color }}
        >
          {stateCfg.label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Focus Score - Big number display */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="big-number"
              style={{ fontSize: "48px", color: stateCfg.color, lineHeight: 1 }}
            >
              {score}
            </div>
            <div className="mono-xs text-text-muted mt-1">
              FOCUS INDEX
            </div>
          </div>

          {/* Focus circle */}
          <div className="relative w-16 h-16">
            <svg width="64" height="64" className="transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#2A2A2A"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={stateCfg.color}
                strokeWidth="4"
                strokeDasharray={`${(score / 100) * 163} 163`}
                style={{
                  filter: `drop-shadow(0 0 4px ${stateCfg.color})`,
                  transition: "stroke-dasharray 1s ease",
                }}
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center mono-xs font-bold"
              style={{ color: stateCfg.color }}
            >
              {score}%
            </div>
          </div>
        </div>

        <div className="amber-divider" />

        {/* Energy Level */}
        <div>
          <div className="flex justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap size={10} color={energyColor} />
              <span className="mono-xs text-text-muted">ENERGY LEVEL</span>
            </div>
            <span
              className="mono-xs font-bold"
              style={{ color: energyColor }}
            >
              {energy.toUpperCase()}
            </span>
          </div>
          <EnergyBar
            value={
              energy === "high"
                ? 85
                : energy === "medium"
                ? 55
                : energy === "low"
                ? 25
                : 10
            }
            color={energyColor}
          />
        </div>

        {/* Window Quality */}
        {focusData?.currentWindowQuality && (
          <div>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Eye size={10} color="#F59E0B" />
                <span className="mono-xs text-text-muted">
                  FOCUS WINDOW
                </span>
              </div>
              <span
                className="mono-xs font-bold"
                style={{
                  color:
                    focusData.currentWindowQuality === "excellent"
                      ? "#10B981"
                      : focusData.currentWindowQuality === "good"
                      ? "#F59E0B"
                      : "#EF4444",
                }}
              >
                {focusData.currentWindowQuality.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div className="amber-divider" />

        {/* Recommendation */}
        {focusData?.recommendation && (
          <div
            className="p-2"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "2px",
            }}
          >
            <div className="mono-xs text-text-muted mb-1">
              AI RECOMMENDATION:
            </div>
            <p
              className="mono-xs leading-relaxed"
              style={{ color: "#A3A3A3" }}
            >
              {focusData.recommendation}
            </p>
          </div>
        )}

        {/* Next Break */}
        {focusData?.nextBreakIn && (
          <div className="flex justify-between">
            <span className="mono-xs text-text-muted">
              NEXT BREAK:
            </span>
            <span
              className="mono-xs font-bold"
              style={{ color: "#10B981" }}
            >
              {focusData.nextBreakIn}
            </span>
          </div>
        )}

        {/* Tips */}
        {focusData?.focusTips?.length > 0 && (
          <div className="space-y-1">
            {focusData.focusTips.slice(0, 2).map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2"
              >
                <span
                  className="mono-xs flex-shrink-0"
                  style={{ color: "#4B5563" }}
                >
                  ›
                </span>
                <span
                  className="mono-xs"
                  style={{ color: "#6B7280" }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};