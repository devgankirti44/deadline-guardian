"use client";
import { useMemo } from "react";
import { formatTimeRemaining, getStatusColor } from "@/lib/riskCalculator";

const RADAR_SIZE = 280;
const CENTER = RADAR_SIZE / 2;
const RINGS = [0.25, 0.5, 0.75, 1.0];

// Place task on radar based on risk and time
const getTaskPosition = (task, index, total) => {
  const risk = task.riskScore || 10;
  // Distance from center = inverse of risk (high risk = closer to center)
  const radius = CENTER * 0.9 * (1 - risk / 110);
  const angle =
    (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
    radius,
    angle,
  };
};

const getRingColor = (ringIndex) => {
  const colors = ["#10B981", "#FCD34D", "#F59E0B", "#EF4444"];
  return colors[ringIndex];
};

export const DeadlineRadar = ({ tasks = [] }) => {
  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.completed).slice(0, 6),
    [tasks]
  );

  return (
    <div
      className="guardian-panel h-full"
      style={{ minHeight: "320px" }}
    >
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">◈ DEADLINE RADAR</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="status-dot status-dot-green w-1.5 h-1.5" />
            <span className="mono-xs text-text-muted">SWEEP ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center">
        {/* SVG Radar */}
        <div className="relative" style={{ width: RADAR_SIZE, height: RADAR_SIZE }}>
          <svg
            width={RADAR_SIZE}
            height={RADAR_SIZE}
            className="overflow-visible"
          >
            {/* Background */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CENTER * 0.95}
              fill="rgba(13,13,13,0.9)"
              stroke="#2A2A2A"
              strokeWidth="1"
            />

            {/* Rings */}
            {RINGS.map((r, i) => (
              <g key={i}>
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={CENTER * 0.9 * r}
                  fill="none"
                  stroke={getRingColor(i)}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  strokeDasharray={i < 3 ? "4 4" : "none"}
                />
                {/* Ring label */}
                <text
                  x={CENTER + CENTER * 0.9 * r + 4}
                  y={CENTER}
                  fill={getRingColor(i)}
                  fontSize="7"
                  fontFamily="JetBrains Mono"
                  opacity="0.6"
                >
                  {i === 0
                    ? "SAFE"
                    : i === 1
                    ? "WARN"
                    : i === 2
                    ? "HIGH"
                    : "CRIT"}
                </text>
              </g>
            ))}

            {/* Cross hairs */}
            <line
              x1={CENTER}
              y1="8"
              x2={CENTER}
              y2={RADAR_SIZE - 8}
              stroke="#2A2A2A"
              strokeWidth="0.5"
            />
            <line
              x1="8"
              y1={CENTER}
              x2={RADAR_SIZE - 8}
              y2={CENTER}
              stroke="#2A2A2A"
              strokeWidth="0.5"
            />

            {/* Diagonal crosshairs */}
            {[45, 135].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const r = CENTER * 0.88;
              return (
                <line
                  key={deg}
                  x1={CENTER - r * Math.cos(rad)}
                  y1={CENTER - r * Math.sin(rad)}
                  x2={CENTER + r * Math.cos(rad)}
                  y2={CENTER + r * Math.sin(rad)}
                  stroke="#1A1A1A"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Sweep Line */}
            <g
              className="radar-sweep-line"
              style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
            >
              <line
                x1={CENTER}
                y1={CENTER}
                x2={CENTER}
                y2={CENTER - CENTER * 0.88}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
              {/* Sweep gradient */}
              <path
                d={`M${CENTER},${CENTER} L${CENTER},${CENTER - CENTER * 0.88} A${CENTER * 0.88},${CENTER * 0.88} 0 0,1 ${
                  CENTER + CENTER * 0.88 * Math.sin((30 * Math.PI) / 180)
                },${
                  CENTER - CENTER * 0.88 * Math.cos((30 * Math.PI) / 180)
                } Z`}
                fill="url(#sweepGradient)"
                opacity="0.3"
              />
              <defs>
                <radialGradient
                  id="sweepGradient"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform={`translate(${CENTER},${CENTER})`}
                >
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>
            </g>

            {/* Center dot */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r="4"
              fill="#F59E0B"
              opacity="0.9"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r="8"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* Task Targets */}
            {activeTasks.map((task, i) => {
              const pos = getTaskPosition(task, i, activeTasks.length);
              const color = getStatusColor(task.riskLevel);
              const isCritical = task.riskLevel === "critical";

              return (
                <g key={task.id}>
                  {/* Ping ring for critical */}
                  {isCritical && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="10"
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      className="animate-radar-ping"
                      opacity="0.6"
                    />
                  )}
                  {/* Target dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isCritical ? 5 : 4}
                    fill={color}
                    className={isCritical ? "radar-target" : ""}
                    style={{
                      filter: `drop-shadow(0 0 4px ${color})`,
                    }}
                  />
                  {/* Cross hair on target */}
                  <line
                    x1={pos.x - 8}
                    y1={pos.y}
                    x2={pos.x + 8}
                    y2={pos.y}
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                  <line
                    x1={pos.x}
                    y1={pos.y - 8}
                    x2={pos.x}
                    y2={pos.y + 8}
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                  {/* Label */}
                 {/* Label - cleaner positioning */}
<text
  x={pos.x + 10}
  y={pos.y + 3}
  fill={color}
  fontSize="8"
  fontFamily="JetBrains Mono"
  fontWeight="600"
  opacity="0.95"
  style={{
    textShadow: "0 0 4px rgba(0,0,0,0.8)",
    paintOrder: "stroke",
    stroke: "#0D0D0D",
    strokeWidth: "2px",
    strokeLinejoin: "round",
  }}
>
  {task.title.length > 10
    ? task.title.slice(0, 10) + "…"
    : task.title}
</text>
                </g>
              );
            })}

            {/* Empty state */}
            {activeTasks.length === 0 && (
              <text
                x={CENTER}
                y={CENTER + 4}
                textAnchor="middle"
                fill="#4B5563"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                NO ACTIVE MISSIONS
              </text>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          {[
            { color: "#10B981", label: "SAFE" },
            { color: "#FCD34D", label: "WARN" },
            { color: "#F59E0B", label: "HIGH" },
            { color: "#EF4444", label: "CRIT" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: item.color }}
              />
              <span className="mono-xs text-text-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Task count */}
        <div className="mt-2 mono-xs text-text-muted">
          {activeTasks.length} ACTIVE TARGETS TRACKED
        </div>
      </div>
    </div>
  );
};