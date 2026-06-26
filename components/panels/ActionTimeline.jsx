"use client";
import { Clock, CheckCircle, Circle, Zap } from "lucide-react";

const TypeColors = {
  execution: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "EXEC" },
  review: { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "REVIEW" },
  break: { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "BREAK" },
  buffer: { color: "#4B5563", bg: "rgba(75,85,99,0.1)", label: "BUFFER" },
};

const PriorityColors = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#FCD34D",
  low: "#10B981",
};

export const ActionTimeline = ({ scheduleData = null }) => {
  const timeline = scheduleData?.timeline || [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const isCurrentBlock = (block) => {
    if (!block.startTime) return false;
    const [startH, startM] = block.startTime.split(":").map(Number);
    const [endH, endM] = (block.endTime || "23:59").split(":").map(Number);
    const current = currentHour * 60 + currentMin;
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    return current >= start && current <= end;
  };

  const isPastBlock = (block) => {
    if (!block.startTime) return false;
    const [endH, endM] = (block.endTime || "00:00").split(":").map(Number);
    const current = currentHour * 60 + currentMin;
    const end = endH * 60 + endM;
    return current > end;
  };

  return (
    <div className="guardian-panel h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Clock size={12} color="#F59E0B" />
          <span className="panel-title">ACTION TIMELINE</span>
        </div>
        <span className="mono-xs text-text-muted">
          {now.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).toUpperCase()}
        </span>
      </div>

      {/* Command Message */}
      {scheduleData?.commandMessage && (
        <div
          className="px-4 py-2 mono-xs"
          style={{
            background: "rgba(245,158,11,0.06)",
            borderBottom: "1px solid #2A2A2A",
            color: "#F59E0B",
          }}
        >
          ▶ {scheduleData.commandMessage}
        </div>
      )}

      {/* Focus + Completion Row */}
      {scheduleData?.todayFocus && (
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{ borderBottom: "1px solid #2A2A2A" }}
        >
          <div>
            <span className="mono-xs text-text-muted">PRIORITY: </span>
            <span
              className="mono-xs font-bold"
              style={{ color: "#FCD34D" }}
            >
              {scheduleData.todayFocus}
            </span>
          </div>
          <span className="mono-xs text-text-muted">
            {scheduleData.estimatedCompletion}
          </span>
        </div>
      )}

      {/* Timeline */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "360px" }}
      >
        {timeline.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mono-xs text-text-muted mb-2">
              NO TIMELINE GENERATED
            </div>
            <div className="mono-xs text-text-muted opacity-60">
              Add tasks and run AI scan to generate execution plan
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-12 top-0 bottom-0 w-px"
              style={{ background: "#2A2A2A" }}
            />

            {timeline.map((block, i) => {
              const isCurrent = isCurrentBlock(block);
              const isPast = isPastBlock(block);
              const typeCfg =
                TypeColors[block.type] || TypeColors.execution;
              const priorityColor =
                PriorityColors[block.priority] || "#6B7280";

              return (
                <div
                  key={block.id || i}
                  className="relative flex gap-0 px-4 py-3 guardian-row"
                  style={
                    isCurrent
                      ? {
                          background: "rgba(245,158,11,0.06)",
                          borderLeft: "2px solid #F59E0B",
                        }
                      : {}
                  }
                >
                  {/* Time column */}
                  <div
                    className="w-8 flex-shrink-0 text-right mr-4"
                    style={{ paddingTop: "2px" }}
                  >
                    <span
                      className="mono-xs"
                      style={{
                        color: isCurrent ? "#F59E0B" : "#4B5563",
                        fontSize: "9px",
                      }}
                    >
                      {block.startTime}
                    </span>
                  </div>

                  {/* Node */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: "44px",
                      top: "14px",
                      width: "12px",
                      height: "12px",
                      background:
                        isCurrent
                          ? "#F59E0B"
                          : isPast
                          ? "#2A2A2A"
                          : "#141414",
                      border: `1px solid ${
                        isCurrent ? "#F59E0B" : "#2A2A2A"
                      }`,
                      borderRadius: "50%",
                      zIndex: 1,
                    }}
                  >
                    {isPast && !isCurrent && (
                      <CheckCircle
                        size={8}
                        color="#4B5563"
                      />
                    )}
                    {isCurrent && (
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: "#0D0D0D" }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pl-6 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="mono-xs font-bold"
                        style={{ color: isCurrent ? "#FCD34D" : "#E5E5E5" }}
                      >
                        {block.taskTitle}
                      </span>
                      {isCurrent && (
                        <span
                          className="mono-xs font-bold animate-pulse"
                          style={{ color: "#F59E0B" }}
                        >
                          ◉ NOW
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="mono-xs px-1.5 py-0.5"
                        style={{
                          background: typeCfg.bg,
                          color: typeCfg.color,
                          fontSize: "9px",
                        }}
                      >
                        {typeCfg.label}
                      </span>
                      <span
                        className="mono-xs"
                        style={{ color: "#4B5563", fontSize: "9px" }}
                      >
                        {block.startTime} – {block.endTime}
                      </span>
                      {block.priority && block.priority !== "low" && (
                        <span
                          className="mono-xs"
                          style={{
                            color: priorityColor,
                            fontSize: "9px",
                          }}
                        >
                          ● {block.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {block.objective && (
                      <div
                        className="mono-xs mt-1"
                        style={{ color: "#6B7280" }}
                      >
                        → {block.objective}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buffer info */}
      {scheduleData?.bufferTime && (
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ borderTop: "1px solid #2A2A2A" }}
        >
          <Zap size={10} color="#4B5563" />
          <span className="mono-xs text-text-muted">
            BUFFER: {scheduleData.bufferTime}
          </span>
        </div>
      )}
    </div>
  );
};