"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect, useMemo } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import { FocusMode } from "@/components/focus/FocusMode";
import {
  Crosshair, Play, Clock, Flame, Target, Brain,
  Sparkles, Zap, CheckCircle, Activity, Coffee,
  Sunrise, Sun, Sunset, Moon,
} from "lucide-react";

// ─── MISSION CARD FOR FOCUS SELECTION ───────────
const FocusMissionCard = ({ task, onSelect, recommended }) => {
  const color = task.riskLevel === "critical" ? "#EF4444"
    : task.riskLevel === "high" ? "#F59E0B"
    : task.riskLevel === "medium" ? "#FCD34D" : "#10B981";

  const hoursLeft = task.deadline
    ? Math.round((new Date(task.deadline) - new Date()) / 3600000)
    : null;

  return (
    <button
      onClick={() => onSelect(task)}
      className="text-left group transition-all"
      style={{
        background: recommended
          ? `linear-gradient(135deg, ${color}10 0%, transparent 100%)`
          : "rgba(255,255,255,0.02)",
        borderRadius: "16px",
        padding: "24px",
        border: recommended ? `1px solid ${color}40` : "1px solid transparent",
        borderLeft: `3px solid ${color}`,
        cursor: "pointer",
        width: "100%",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {recommended && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            padding: "3px 10px",
            background: color,
            color: "#0D0D0D",
            fontSize: "9px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            fontFamily: "JetBrains Mono, monospace",
            borderRadius: "100px",
          }}
        >
          AI PICK
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
              border: `1px solid ${color}40`,
            }}
          >
            <Crosshair size={18} color={color} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div style={{
            color: color,
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.15em",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "6px",
          }}>
            {(task.riskLabel || "NOMINAL").toUpperCase()} · {task.riskScore || 0}%
          </div>
          <h3 style={{
            color: "#FAFAFA",
            fontSize: "17px",
            fontWeight: "600",
            lineHeight: "1.3",
            marginBottom: "4px",
          }}>
            {task.title}
          </h3>
          {task.description && (
            <p style={{ color: "#A3A3A3", fontSize: "12px", lineHeight: "1.5" }}>
              {task.description.length > 80
                ? task.description.slice(0, 80) + "…"
                : task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {hoursLeft !== null && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} color={hoursLeft < 24 ? "#EF4444" : "#6B7280"} />
            <span style={{
              color: hoursLeft < 24 ? "#EF4444" : "#A3A3A3",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {hoursLeft <= 0 ? "OVERDUE" : hoursLeft < 24 ? `${hoursLeft}h LEFT` : `${Math.floor(hoursLeft / 24)}d LEFT`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Zap size={12} color="#6B7280" />
          <span style={{ color: "#A3A3A3", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
            ~{task.estimatedHours || 1}h work
          </span>
        </div>
        {task.category && (
          <span style={{ color: "#6B7280", fontSize: "11px" }}>
            {task.category}
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-2 transition-all group-hover:gap-3"
        style={{
          padding: "10px",
          background: color,
          color: "#0D0D0D",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.05em",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <Play size={12} fill="#0D0D0D" />
        ENTER FOCUS ZONE
      </div>
    </button>
  );
};

// ─── SESSION STATS ───────────────────────────
const SessionStats = ({ tasks }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = tasks.filter(t => 
    t.completed && t.completedAt && new Date(t.completedAt) >= today
  );

  const completedThisWeek = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(t.completedAt) >= weekAgo;
  });

  // Estimated focus time (25 min per completed task)
  const focusMinutesToday = completedToday.length * 25;
  const focusHoursToday = Math.floor(focusMinutesToday / 60);
  const focusMinsRemainder = focusMinutesToday % 60;

  // Streak calculation
  const calculateStreak = () => {
    const sorted = tasks
      .filter(t => t.completed && t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    if (sorted.length === 0) return 0;
    
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasCompletion = sorted.some(t => {
        const cDate = new Date(t.completedAt);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === checkDate.getTime();
      });
      if (hasCompletion) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const streak = calculateStreak();

  const stats = [
    {
      label: "FOCUS TIME TODAY",
      value: focusHoursToday > 0 ? `${focusHoursToday}h ${focusMinsRemainder}m` : `${focusMinutesToday}m`,
      icon: Clock,
      color: "#10B981",
    },
    {
      label: "SESSIONS TODAY",
      value: completedToday.length,
      icon: Target,
      color: "#F59E0B",
    },
    {
      label: "THIS WEEK",
      value: completedThisWeek.length,
      icon: Activity,
      color: "#34D399",
    },
    {
      label: "ACTIVE STREAK",
      value: streak,
      sublabel: streak === 1 ? "day" : "days",
      icon: Flame,
      color: "#EF4444",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div style={{
              color: stat.color,
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.2em",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {stat.label}
            </div>
            <stat.icon size={14} color={stat.color} style={{ opacity: 0.5 }} />
          </div>
          <div className="flex items-baseline gap-2">
            <span style={{
              color: stat.color,
              fontSize: "32px",
              fontWeight: "700",
              fontFamily: "JetBrains Mono, monospace",
              lineHeight: "1",
            }}>
              {stat.value}
            </span>
            {stat.sublabel && (
              <span style={{ color: "#6B7280", fontSize: "12px" }}>
                {stat.sublabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── AI FOCUS COACH ─────────────────────────────
const FocusCoach = ({ tasks }) => {
  const hour = new Date().getHours();
  
  const insights = useMemo(() => {
    const insights = [];
    
    // Time of day analysis
    let timeOfDay, timeIcon, timeMessage;
    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning";
      timeIcon = Sunrise;
      timeMessage = "Morning hours are peak cognitive time. Best for deep work and complex problems.";
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
      timeIcon = Sun;
      timeMessage = "Afternoon focus window. Good for execution-heavy tasks and creative work.";
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = "evening";
      timeIcon = Sunset;
      timeMessage = "Evening energy. Best for review, planning, and lighter mental tasks.";
    } else {
      timeOfDay = "night";
      timeIcon = Moon;
      timeMessage = "Late hours. Productivity may be reduced. Consider rest or quick wins only.";
    }

    insights.push({
      type: "timing",
      icon: timeIcon,
      title: `${timeOfDay.toUpperCase()} FOCUS WINDOW`,
      text: timeMessage,
      color: hour >= 5 && hour < 12 ? "#F59E0B"
        : hour >= 12 && hour < 17 ? "#FCD34D"
        : hour >= 17 && hour < 21 ? "#F97316"
        : "#6366F1",
    });

    // Active task analysis
    const critical = tasks.filter(t => !t.completed && t.riskLevel === "critical");
    if (critical.length > 0) {
      insights.push({
        type: "alert",
        icon: Zap,
        title: "CRITICAL MISSION DETECTED",
        text: `${critical.length} critical mission${critical.length > 1 ? "s" : ""} require focus. Recommend starting with: "${critical[0].title}"`,
        color: "#EF4444",
      });
    }

    // Streak motivation
    const completed = tasks.filter(t => t.completed && t.completedAt);
    if (completed.length === 0) {
      insights.push({
        type: "motivation",
        icon: Sparkles,
        title: "BEGIN YOUR JOURNEY",
        text: "No completed missions yet. Your first focus session starts now. The hardest step is starting.",
        color: "#34D399",
      });
    } else if (completed.length > 5) {
      insights.push({
        type: "motivation",
        icon: Sparkles,
        title: "MOMENTUM ACTIVE",
        text: `${completed.length} missions completed. You've built strong execution muscle. Trust the process.`,
        color: "#10B981",
      });
    }

    // Pomodoro tip
    insights.push({
      type: "tip",
      icon: Coffee,
      title: "POMODORO PROTOCOL",
      text: "25 minutes focused work → 5 minute break. After 4 sessions, take 15 minute recharge. Sound enabled by default.",
      color: "#FCD34D",
    });

    return insights;
  }, [tasks, hour]);

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="flex items-start gap-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: "12px",
            padding: "16px 20px",
            borderLeft: `2px solid ${insight.color}`,
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: "36px",
              height: "36px",
              background: `${insight.color}15`,
              border: `1px solid ${insight.color}40`,
              borderRadius: "8px",
            }}
          >
            <insight.icon size={16} color={insight.color} />
          </div>
          <div className="flex-1">
            <div style={{
              color: insight.color,
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.15em",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "6px",
            }}>
              {insight.title}
            </div>
            <p style={{ color: "#E5E5E5", fontSize: "13px", lineHeight: "1.6" }}>
              {insight.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN FOCUS ROOM PAGE
// ═══════════════════════════════════════════════
export default function FocusRoomPage() {
  const [user, setUser] = useState(null);
  const [focusTask, setFocusTask] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  const { tasks, activeTasks, completeTask } = useTasks(user?.uid);

  // AI picks best task to focus on
  const sortedTasks = [...activeTasks].sort((a, b) => {
    if (a.riskLevel === "critical" && b.riskLevel !== "critical") return -1;
    if (b.riskLevel === "critical" && a.riskLevel !== "critical") return 1;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const recommendedTask = sortedTasks[0];
  const topMissions = sortedTasks.slice(0, 6);

  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)", minHeight: "100vh" }}>
        
        {/* HERO */}
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
            <span style={{
              color: "#10B981",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.25em",
              fontWeight: "500",
            }}>
              FOCUS ROOM
            </span>
          </div>

          <h1 style={{
            fontSize: "56px",
            fontWeight: "700",
            lineHeight: "1.05",
            letterSpacing: "-0.03em",
            color: "#FAFAFA",
            fontFamily: "Inter, sans-serif",
            marginBottom: "12px",
          }}>
            Enter the <span style={{ color: "#10B981" }}>deep work</span> zone.
          </h1>

          <p style={{ color: "#A3A3A3", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px" }}>
            Pick a mission. Block distractions. Execute with intensity.
            The Pomodoro protocol enforces 25-minute focus sprints with strategic breaks.
          </p>
        </div>

        {/* SESSION STATS */}
        <div className="px-12 pb-12">
          <SessionStats tasks={tasks} />
        </div>

        {/* MISSION SELECTOR */}
        <div className="px-12 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <Crosshair size={18} color="#10B981" />
            <div>
              <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                Select Your Mission
              </h2>
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                {topMissions.length > 0
                  ? "AI has prioritized your missions. Pick one to enter focus mode."
                  : "No active missions. Add some in Operations to start focusing."}
              </p>
            </div>
          </div>

          {topMissions.length === 0 ? (
            <div
              className="py-16 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)",
                borderRadius: "16px",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 mb-4"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  borderRadius: "50%",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <CheckCircle size={28} color="#10B981" />
              </div>
              <h3 style={{ color: "#10B981", fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>
                Inbox Zero, Operator
              </h3>
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                No missions to focus on. Take a break or add new objectives.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {topMissions.map((task, i) => (
                <FocusMissionCard
                  key={task.id}
                  task={task}
                  onSelect={setFocusTask}
                  recommended={i === 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI FOCUS COACH */}
        <div className="px-12 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <Brain size={18} color="#34D399" />
            <div>
              <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                AI Focus Coach
              </h2>
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                Personalized guidance based on your patterns and current state
              </p>
            </div>
          </div>
          <FocusCoach tasks={tasks} />
        </div>

        {/* PROTOCOL EXPLAINER */}
        <div className="px-12 pb-16">
          <div
            className="p-8 grid grid-cols-2 gap-8"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 100%)",
              borderRadius: "16px",
            }}
          >
            <div>
              <div style={{ color: "#F59E0B", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace", marginBottom: "12px" }}>
                FOCUS PROTOCOL
              </div>
              <h3 style={{ color: "#FAFAFA", fontSize: "22px", fontWeight: "600", marginBottom: "12px" }}>
                The 25/5/15 Method
              </h3>
              <p style={{ color: "#A3A3A3", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                Scientifically proven cycle for sustained deep work. Your brain works in 90-minute ultradian rhythms — we optimize within that.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
                  <span style={{ color: "#E5E5E5", fontSize: "13px" }}>
                    <strong>25 min</strong> focused execution
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                  <span style={{ color: "#E5E5E5", fontSize: "13px" }}>
                    <strong>5 min</strong> recharge break
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
                  <span style={{ color: "#E5E5E5", fontSize: "13px" }}>
                    Every 4 cycles: <strong>15 min</strong> long break
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ color: "#34D399", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace", marginBottom: "12px" }}>
                IN-SESSION FEATURES
              </div>
              <h3 style={{ color: "#FAFAFA", fontSize: "22px", fontWeight: "600", marginBottom: "12px" }}>
                Built for deep focus
              </h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3">
                  <Target size={14} color="#10B981" className="mt-1 flex-shrink-0" />
                  <div>
                    <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "500" }}>
                      Single-task mode
                    </div>
                    <div style={{ color: "#6B7280", fontSize: "12px" }}>
                      Full-screen view eliminates distractions
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity size={14} color="#F59E0B" className="mt-1 flex-shrink-0" />
                  <div>
                    <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "500" }}>
                      Visual progress ring
                    </div>
                    <div style={{ color: "#6B7280", fontSize: "12px" }}>
                      Glowing circular timer with countdown
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Coffee size={14} color="#34D399" className="mt-1 flex-shrink-0" />
                  <div>
                    <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "500" }}>
                      Automatic breaks
                    </div>
                    <div style={{ color: "#6B7280", fontSize: "12px" }}>
                      Audio cues guide work/rest transitions
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flame size={14} color="#EF4444" className="mt-1 flex-shrink-0" />
                  <div>
                    <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "500" }}>
                      Session tracking
                    </div>
                    <div style={{ color: "#6B7280", fontSize: "12px" }}>
                      Counts sessions and total focus time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onComplete={completeTask}
        />
      )}
    </AppShell>
  );
}