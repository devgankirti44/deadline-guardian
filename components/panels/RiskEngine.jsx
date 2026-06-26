"use client";
import { useMemo } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { RiskBadge } from "@/components/shared/StatusIndicator";
import { formatTimeRemaining, getStatusColor } from "@/lib/riskCalculator";

const RiskBar = ({ score, level }) => {
  const color = getStatusColor(level);
  return (
    <div className="progress-bar-amber">
      <div
        className="progress-bar-amber-fill"
        style={{
          width: `${score}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
        }}
      />
    </div>
  );
};

export const RiskEngine = ({ tasks = [], riskData = null }) => {
  const sortedTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => !t.completed)
        .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
        .slice(0, 6),
    [tasks]
  );

  const systemStatus = riskData?.overallSystemStatus || "stable";

  return (
    <div className="guardian-panel h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <TrendingUp size={12} color="#F59E0B" />
          <span className="panel-title">RISK PREDICTION ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="mono-xs font-bold"
            style={{
              color:
                systemStatus === "critical"
                  ? "#EF4444"
                  : systemStatus === "warning"
                  ? "#F59E0B"
                  : "#10B981",
            }}
          >
            {systemStatus.toUpperCase()}
          </span>
          <span className="status-dot status-dot-amber w-2 h-2" />
        </div>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-3 gap-px"
        style={{ background: "#2A2A2A" }}
      >
        {[
          {
            label: "CRITICAL",
            value: tasks.filter(
              (t) => !t.completed && t.riskLevel === "critical"
            ).length,
            color: "#EF4444",
          },
          {
            label: "HIGH RISK",
            value: tasks.filter(
              (t) => !t.completed && t.riskLevel === "high"
            ).length,
            color: "#F59E0B",
          },
          {
            label: "NOMINAL",
            value: tasks.filter(
              (t) => !t.completed && t.riskLevel === "low"
            ).length,
            color: "#10B981",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center py-2"
            style={{ background: "#141414" }}
          >
            <span
              className="big-number text-xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="mono-xs text-text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Task Risk List */}
      <div className="divide-y" style={{ borderColor: "#1A1A1A" }}>
        {sortedTasks.length === 0 ? (
          <div className="p-6 text-center">
            <span className="mono-xs text-text-muted">
              NO ACTIVE MISSIONS TO ANALYZE
            </span>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="guardian-row px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-medium truncate flex-1 mr-2"
                  style={{ color: "#E5E5E5" }}
                >
                  {task.title}
                </span>
                <RiskBadge
                  level={task.riskLevel}
                  score={task.riskScore}
                />
              </div>
              <RiskBar
                score={task.riskScore || 0}
                level={task.riskLevel}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="mono-xs text-text-muted">
                  {formatTimeRemaining(
                    task.deadline
                      ? (new Date(task.deadline) - new Date()) /
                          (1000 * 60 * 60)
                      : null
                  )}
                </span>
                {task.riskLevel === "critical" && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle
                      size={9}
                      color="#EF4444"
                      className="animate-pulse"
                    />
                    <span
                      className="mono-xs font-bold"
                      style={{ color: "#EF4444" }}
                    >
                      IMMEDIATE ACTION
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Insight */}
      {riskData?.criticalCount > 0 && (
        <div
          className="p-3 m-3 mt-0"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "2px",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={10} color="#EF4444" />
            <span
              className="mono-xs font-bold"
              style={{ color: "#EF4444" }}
            >
              THREAT ASSESSMENT
            </span>
          </div>
          <p className="mono-xs text-text-secondary leading-relaxed">
            {riskData.criticalCount} MISSION
            {riskData.criticalCount > 1 ? "S" : ""} AT CRITICAL RISK.{" "}
            {riskData.totalThreats || 0} TOTAL THREATS DETECTED.
          </p>
        </div>
      )}
    </div>
  );
};