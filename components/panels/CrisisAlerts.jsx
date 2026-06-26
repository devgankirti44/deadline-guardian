"use client";
import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp, Zap } from "lucide-react";

const SeverityConfig = {
  CRITICAL: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.4)",
    color: "#EF4444",
    label: "CRITICAL",
  },
  HIGH: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.4)",
    color: "#F59E0B",
    label: "HIGH",
  },
  WARNING: {
    bg: "rgba(252,211,77,0.06)",
    border: "rgba(252,211,77,0.3)",
    color: "#FCD34D",
    label: "WARNING",
  },
};

const CrisisCard = ({ crisis, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = SeverityConfig[crisis.severity] || SeverityConfig.WARNING;

  return (
    <div
      className="mb-2 animate-slide-in-left"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: "2px",
      }}
    >
      {/* Crisis Header */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-start gap-2 flex-1">
          <AlertTriangle
            size={12}
            color={cfg.color}
            className="mt-0.5 flex-shrink-0 animate-pulse"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="mono-xs font-bold"
                style={{ color: cfg.color }}
              >
                [{crisis.severity}]
              </span>
              <span
                className="mono-xs font-bold truncate"
                style={{ color: "#E5E5E5" }}
              >
                {crisis.headline}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="mono-xs"
                style={{ color: cfg.color }}
              >
                ⏱ {crisis.timeRemaining}
              </span>
              <span
                className="mono-xs"
                style={{ color: "#6B7280" }}
              >
                {crisis.protocol}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-text-muted hover:text-white p-1 transition-colors"
          >
            {expanded ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>
          {onDismiss && (
            <button
              onClick={() => onDismiss(crisis.taskId)}
              className="text-text-muted hover:text-crisis-red p-1 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          className="px-3 pb-3 space-y-2"
          style={{ borderTop: `1px solid ${cfg.border}` }}
        >
          {/* Impact */}
          {crisis.impactStatement && (
            <div className="pt-2">
              <span className="mono-xs text-text-muted">IMPACT: </span>
              <span className="mono-xs" style={{ color: "#A3A3A3" }}>
                {crisis.impactStatement}
              </span>
            </div>
          )}

          {/* Immediate Actions */}
          {crisis.immediateActions?.length > 0 && (
            <div>
              <div className="mono-xs text-text-muted mb-1">
                IMMEDIATE ACTIONS:
              </div>
              <div className="space-y-1">
                {crisis.immediateActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                  >
                    <span
                      className="mono-xs flex-shrink-0"
                      style={{ color: cfg.color }}
                    >
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span
                      className="mono-xs"
                      style={{ color: "#A3A3A3" }}
                    >
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation */}
          {crisis.escalationRequired && (
            <div
              className="flex items-center gap-2 pt-1"
              style={{
                borderTop: `1px solid ${cfg.border}`,
                paddingTop: "8px",
              }}
            >
              <Zap size={10} color={cfg.color} />
              <span
                className="mono-xs font-bold"
                style={{ color: cfg.color }}
              >
                ESCALATION REQUIRED — NOTIFY STAKEHOLDERS
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CrisisAlerts = ({ crisisData = null, onDismiss }) => {
  const crises = crisisData?.crises || [];
  const hasCritical = crisisData?.hasCritical || false;
  const systemAlert = crisisData?.systemAlert;

  return (
    <div
      className="guardian-panel h-full"
      style={
        hasCritical
          ? {
              border: "1px solid rgba(239,68,68,0.4)",
              boxShadow: "0 0 20px rgba(239,68,68,0.1)",
            }
          : {}
      }
    >
      {/* Header */}
      <div
        className="panel-header"
        style={
          hasCritical
            ? { background: "rgba(239,68,68,0.08)" }
            : {}
        }
      >
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={12}
            color={hasCritical ? "#EF4444" : "#F59E0B"}
            className={hasCritical ? "animate-pulse" : ""}
          />
          <span className="panel-title">CRISIS ALERT SYSTEM</span>
        </div>
        <div className="flex items-center gap-2">
          {hasCritical ? (
            <span
              className="mono-xs font-bold animate-pulse"
              style={{ color: "#EF4444" }}
            >
              {crises.length} ALERT{crises.length !== 1 ? "S" : ""}
            </span>
          ) : (
            <span
              className="mono-xs"
              style={{ color: "#10B981" }}
            >
              ALL CLEAR
            </span>
          )}
          <span
            className={`status-dot w-2 h-2 ${
              hasCritical ? "status-dot-red" : "status-dot-green"
            }`}
          />
        </div>
      </div>

      {/* System Alert Banner */}
      {systemAlert && (
        <div
          className="px-4 py-2 mono-xs font-bold"
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#F87171",
            borderBottom: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          ▶ {systemAlert}
        </div>
      )}

      {/* Crisis List */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: "340px" }}>
        {crises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                border: "1px solid #10B981",
                borderRadius: "50%",
              }}
            >
              <span style={{ color: "#10B981", fontSize: "18px" }}>✓</span>
            </div>
            <div className="text-center">
              <div
                className="mono-xs font-bold mb-1"
                style={{ color: "#10B981" }}
              >
                SYSTEMS NOMINAL
              </div>
              <div className="mono-xs text-text-muted">
                No critical alerts detected
              </div>
            </div>
          </div>
        ) : (
          crises.map((crisis, i) => (
            <CrisisCard
              key={i}
              crisis={crisis}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
};