"use client";
import { Clock, Check, Trash2 } from "lucide-react";

const RiskDot = ({ level }) => {
  const colors = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#FCD34D",
    low: "#10B981",
  };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[level] || "#6B7280" }}
    />
  );
};

const formatTimeLeft = (deadline) => {
  if (!deadline) return "No deadline";
  const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
  if (hours < 0) return "Overdue";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Tomorrow" : `${days} days`;
};

export const UpcomingList = ({ tasks, onComplete, onDelete }) => {
  const upcoming = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (a.riskLevel === "critical" && b.riskLevel !== "critical") return -1;
      if (b.riskLevel === "critical" && a.riskLevel !== "critical") return 1;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(1); // Skip the first one (it's in hero)

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-bold text-sm tracking-wider"
          style={{ color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}
        >
          UPCOMING ({upcoming.length})
        </h3>
      </div>

      <div className="space-y-2">
        {upcoming.map((task) => (
          <div
            key={task.id}
            className="rounded-lg p-4 flex items-center gap-4 group transition-all hover:bg-white/5"
            style={{
              background: "#141414",
              border: "1px solid #2A2A2A",
            }}
          >
            <RiskDot level={task.riskLevel} />

            <div className="flex-1 min-w-0">
              <div
                className="font-medium truncate"
                style={{ color: "#E5E5E5", fontSize: "15px" }}
              >
                {task.title}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "#6B7280" }}
                >
                  <Clock size={11} />
                  {formatTimeLeft(task.deadline)}
                </span>
                {task.category && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      color: "#FCD34D",
                    }}
                  >
                    {task.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onComplete(task.id)}
                className="p-2 rounded transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
                title="Complete"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 rounded transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};