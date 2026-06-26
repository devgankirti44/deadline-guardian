"use client";

export const StatusDot = ({ status = "green", size = "sm", pulse = true }) => {
  const sizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const dotClass = {
    green: "status-dot-green",
    amber: "status-dot-amber",
    red: "status-dot-red",
    grey: "status-dot-grey",
  };

  return (
    <span
      className={`status-dot ${sizes[size]} ${dotClass[status]} ${
        !pulse ? "animation-none" : ""
      }`}
    />
  );
};

export const SystemStatusBar = ({ status = "STABLE" }) => {
  const config = {
    OPTIMAL: { dot: "green", color: "#10B981", label: "ALL SYSTEMS OPTIMAL" },
    STABLE: { dot: "green", color: "#10B981", label: "SYSTEMS STABLE" },
    WARNING: { dot: "amber", color: "#F59E0B", label: "WARNING DETECTED" },
    CRITICAL: { dot: "red", color: "#EF4444", label: "CRITICAL ALERT" },
  };

  const cfg = config[status] || config.STABLE;

  return (
    <div className="flex items-center gap-2">
      <StatusDot status={cfg.dot} size="sm" />
      <span
        className="mono-xs font-bold tracking-widest"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  );
};

export const LiveIndicator = () => (
  <div className="flex items-center gap-1.5">
    <span className="status-dot-red w-2 h-2 status-dot" />
    <span className="mono-xs text-crisis-red font-bold tracking-widest">
      LIVE
    </span>
  </div>
);

export const RiskBadge = ({ level = "low", score }) => {
  const config = {
    critical: { cls: "risk-critical", label: "CRITICAL" },
    high: { cls: "risk-high", label: "HIGH RISK" },
    medium: { cls: "risk-medium", label: "MONITOR" },
    low: { cls: "risk-low", label: "NOMINAL" },
  };
  const cfg = config[level] || config.low;
  return (
    <span className={cfg.cls}>
      {score !== undefined ? `${score}% ` : ""}
      {cfg.label}
    </span>
  );
};