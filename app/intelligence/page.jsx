"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect, useMemo } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import {
  Brain, TrendingUp, TrendingDown, Activity, Zap, Target,
  Clock, Award, AlertTriangle, CheckCircle, BarChart3,
  Calendar, Flame, Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

// ─── ANALYTICS CARD ───────────────────────────
const StatCard = ({ label, value, sublabel, color, icon: Icon, trend }) => (
  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "20px" }}>
    <div className="flex items-start justify-between mb-3">
      <div style={{ color, fontSize: "10px", fontWeight: "600", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace" }}>
        {label}
      </div>
      <Icon size={16} color={color} style={{ opacity: 0.5 }} />
    </div>
    <div style={{ color, fontSize: "36px", fontWeight: "700", lineHeight: "1", fontFamily: "JetBrains Mono, monospace" }}>
      {value}
    </div>
    {sublabel && (
      <div className="mt-2 flex items-center gap-1">
        {trend === "up" && <ArrowUpRight size={11} color="#10B981" />}
        {trend === "down" && <ArrowDownRight size={11} color="#EF4444" />}
        <span style={{ color: "#6B7280", fontSize: "11px" }}>{sublabel}</span>
      </div>
    )}
  </div>
);

// ─── CATEGORY BREAKDOWN ───────────────────────
const CategoryChart = ({ tasks }) => {
  const breakdown = tasks.reduce((acc, t) => {
    const cat = t.category || "Other";
    if (!acc[cat]) acc[cat] = { total: 0, completed: 0 };
    acc[cat].total++;
    if (t.completed) acc[cat].completed++;
    return acc;
  }, {});

  const categories = Object.entries(breakdown).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...categories.map(([_, v]) => v.total));

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
        <p style={{ color: "#6B7280", fontSize: "13px" }}>No category data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map(([cat, data]) => {
        const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        const width = (data.total / maxTotal) * 100;
        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ color: "#E5E5E5", fontSize: "13px", fontWeight: "500" }}>{cat}</span>
              <div className="flex items-center gap-3">
                <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                  {completionRate}%
                </span>
                <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                  {data.completed}/{data.total}
                </span>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${width}%`,
                  height: "100%",
                  background: completionRate >= 70 ? "linear-gradient(90deg, #10B981, #34D399)"
                    : completionRate >= 40 ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                    : "linear-gradient(90deg, #EF4444, #F87171)",
                  borderRadius: "100px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── RISK DISTRIBUTION ───────────────────────
const RiskDistribution = ({ tasks }) => {
  const activeTasks = tasks.filter(t => !t.completed);
  const counts = {
    critical: activeTasks.filter(t => t.riskLevel === "critical").length,
    high: activeTasks.filter(t => t.riskLevel === "high").length,
    medium: activeTasks.filter(t => t.riskLevel === "medium").length,
    low: activeTasks.filter(t => t.riskLevel === "low").length,
  };
  const total = activeTasks.length || 1;

  const segments = [
    { label: "Critical", count: counts.critical, color: "#EF4444" },
    { label: "High", count: counts.high, color: "#F59E0B" },
    { label: "Medium", count: counts.medium, color: "#FCD34D" },
    { label: "Nominal", count: counts.low, color: "#10B981" },
  ];

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-3 overflow-hidden rounded-full mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
        {segments.map((s) => (
          s.count > 0 && (
            <div
              key={s.label}
              style={{
                width: `${(s.count / total) * 100}%`,
                background: s.color,
                transition: "width 0.5s",
              }}
              title={`${s.label}: ${s.count}`}
            />
          )
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span style={{ color: "#A3A3A3", fontSize: "12px" }}>{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: s.color, fontSize: "16px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
                {s.count}
              </span>
              <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                {Math.round((s.count / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── WEEKLY ACTIVITY HEATMAP ───────────────────
const WeeklyActivity = ({ tasks }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const activityData = last7Days.map(day => {
    const dayStr = day.toDateString();
    const completed = tasks.filter(t => 
      t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dayStr
    ).length;
    const created = tasks.filter(t => 
      t.createdAt && new Date(t.createdAt).toDateString() === dayStr
    ).length;
    return { day, completed, created };
  });

  const maxValue = Math.max(...activityData.map(d => Math.max(d.completed, d.created)), 1);

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="flex items-end justify-between gap-2 mb-3" style={{ height: "120px" }}>
        {activityData.map((d, i) => {
          const completedHeight = (d.completed / maxValue) * 100;
          const createdHeight = (d.created / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 flex-1">
                <div
                  className="flex-1"
                  style={{
                    height: `${completedHeight}%`,
                    background: "linear-gradient(180deg, #10B981, #064E3B)",
                    borderRadius: "3px 3px 0 0",
                    minHeight: d.completed > 0 ? "4px" : "0",
                    transition: "height 0.5s",
                  }}
                  title={`Completed: ${d.completed}`}
                />
                <div
                  className="flex-1"
                  style={{
                    height: `${createdHeight}%`,
                    background: "linear-gradient(180deg, #F59E0B, #92400E)",
                    borderRadius: "3px 3px 0 0",
                    minHeight: d.created > 0 ? "4px" : "0",
                    transition: "height 0.5s",
                  }}
                  title={`Created: ${d.created}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 mb-3">
        {activityData.map((d, i) => (
          <div key={i} className="flex-1 text-center" style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
            {dayNames[d.day.getDay()]}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded" style={{ background: "#10B981" }} />
          <span style={{ color: "#6B7280", fontSize: "11px" }}>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded" style={{ background: "#F59E0B" }} />
          <span style={{ color: "#6B7280", fontSize: "11px" }}>Created</span>
        </div>
      </div>
    </div>
  );
};

// ─── AI INSIGHTS (Local intelligence) ───────────
const AIInsights = ({ tasks }) => {
  const insights = useMemo(() => {
    const insights = [];
    const completed = tasks.filter(t => t.completed);
    const active = tasks.filter(t => !t.completed);
    const critical = active.filter(t => t.riskLevel === "critical");
    
    // Completion rate
    const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;
    
    if (completionRate >= 80) {
      insights.push({
        type: "success",
        icon: Award,
        title: "Exceptional Performance",
        text: `You've completed ${Math.round(completionRate)}% of all missions. You're in the top performance tier.`,
        color: "#10B981",
      });
    } else if (completionRate >= 50) {
      insights.push({
        type: "info",
        icon: TrendingUp,
        title: "Steady Progress",
        text: `${Math.round(completionRate)}% completion rate. Solid execution. Focus on critical missions to push higher.`,
        color: "#F59E0B",
      });
    } else if (tasks.length > 5) {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        title: "Completion Rate Below Average",
        text: `Only ${Math.round(completionRate)}% completed. Consider deferring lower priority missions to focus.`,
        color: "#EF4444",
      });
    }

    // Critical task analysis
    if (critical.length >= 3) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Critical Mission Overload",
        text: `${critical.length} critical missions simultaneously. Cognitive overload risk detected. Recommend single-task focus.`,
        color: "#EF4444",
      });
    } else if (critical.length === 0 && active.length > 0) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        title: "No Critical Threats",
        text: "All missions within acceptable risk parameters. Maintain current execution pace.",
        color: "#10B981",
      });
    }

    // Category dominance
    const categoryBreakdown = tasks.reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= 3) {
      insights.push({
        type: "info",
        icon: Target,
        title: "Behavioral Pattern Detected",
        text: `${topCategory[1]} missions in "${topCategory[0]}" category. Consider time-blocking for batch processing.`,
        color: "#F59E0B",
      });
    }

    // Time estimation accuracy
    const tasksWithEstimates = completed.filter(t => t.estimatedHours);
    if (tasksWithEstimates.length >= 3) {
      const avgEstimate = tasksWithEstimates.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasksWithEstimates.length;
      insights.push({
        type: "info",
        icon: Clock,
        title: "Time Estimation Profile",
        text: `Average mission estimate: ${avgEstimate.toFixed(1)}h. Use this baseline to calibrate future planning.`,
        color: "#FCD34D",
      });
    }

    // Overdue analysis
    const overdue = active.filter(t => t.deadline && new Date(t.deadline) < new Date());
    if (overdue.length > 0) {
      insights.push({
        type: "danger",
        icon: AlertTriangle,
        title: `${overdue.length} Mission${overdue.length > 1 ? "s" : ""} Overdue`,
        text: `Immediate intervention required. Review and either complete, defer, or remove these missions.`,
        color: "#EF4444",
      });
    }

    return insights.slice(0, 5);
  }, [tasks]);

  if (insights.length === 0) {
    return (
      <div className="py-12 text-center" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
        <Brain size={32} color="#4B5563" className="mx-auto mb-3" />
        <p style={{ color: "#6B7280", fontSize: "13px" }}>
          Add more missions to receive AI insights
        </p>
      </div>
    );
  }

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
              {insight.title.toUpperCase()}
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

// ─── HOURLY ACTIVITY PATTERN ───────────────────
const HourlyPattern = ({ tasks }) => {
  const hourCounts = Array(24).fill(0);
  tasks.forEach(t => {
    if (t.completedAt) {
      const hour = new Date(t.completedAt).getHours();
      hourCounts[hour]++;
    }
  });

  const maxCount = Math.max(...hourCounts, 1);
  const peakHour = hourCounts.indexOf(maxCount);
  
  const formatHour = (h) => {
    if (h === 0) return "12AM";
    if (h === 12) return "12PM";
    if (h < 12) return `${h}AM`;
    return `${h - 12}PM`;
  };

  return (
    <div>
      <div className="flex items-end gap-1 mb-3" style={{ height: "100px" }}>
        {hourCounts.map((count, h) => {
          const height = (count / maxCount) * 100;
          const isPeak = h === peakHour && count > 0;
          return (
            <div
              key={h}
              className="flex-1"
              style={{
                height: `${height}%`,
                minHeight: count > 0 ? "3px" : "0",
                background: isPeak ? "linear-gradient(180deg, #F59E0B, #92400E)" : "rgba(245,158,11,0.3)",
                borderRadius: "2px",
                transition: "height 0.5s",
              }}
              title={`${formatHour(h)}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between" style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>11PM</span>
      </div>
      {tasks.filter(t => t.completedAt).length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Zap size={12} color="#F59E0B" />
          <span style={{ color: "#F59E0B", fontSize: "12px" }}>
            Peak productivity: <strong>{formatHour(peakHour)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN INTELLIGENCE PAGE
// ═══════════════════════════════════════════════
export default function IntelligencePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  const { tasks, activeTasks, completedToday } = useTasks(user?.uid);

  // Calculate stats
  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  
  // Calculate streak (simplified)
  const calculateStreak = () => {
    const sortedCompleted = completed
      .filter(t => t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    if (sortedCompleted.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasCompletion = sortedCompleted.some(t => {
        const completedDate = new Date(t.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === checkDate.getTime();
      });
      if (hasCompletion) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const streak = calculateStreak();

  // This week stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const thisWeekCompleted = completed.filter(t => 
    t.completedAt && new Date(t.completedAt) > weekStart
  ).length;
  const thisWeekCreated = tasks.filter(t => 
    t.createdAt && new Date(t.createdAt) > weekStart
  ).length;

  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)", minHeight: "100vh" }}>
        
        {/* HERO */}
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
            <span style={{ color: "#34D399", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.25em", fontWeight: "500" }}>
              INTELLIGENCE CENTER
            </span>
          </div>

          <h1 style={{ fontSize: "56px", fontWeight: "700", lineHeight: "1.05", letterSpacing: "-0.03em", color: "#FAFAFA", fontFamily: "Inter, sans-serif", marginBottom: "12px" }}>
            Your operational <span style={{ color: "#34D399" }}>intelligence</span>.
          </h1>

          <p style={{ color: "#A3A3A3", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px" }}>
            AI-powered analytics revealing your productivity patterns, behavioral insights, and performance trends.
          </p>
        </div>

        {/* TOP STATS */}
        <div className="px-12 pb-8">
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="SUCCESS RATE"
              value={`${successRate}%`}
              sublabel={total > 0 ? `${completed.length} of ${total} missions` : "No data yet"}
              color={successRate >= 70 ? "#10B981" : successRate >= 40 ? "#F59E0B" : "#EF4444"}
              icon={Award}
              trend={successRate >= 60 ? "up" : "down"}
            />
            <StatCard
              label="ACTIVE STREAK"
              value={`${streak}`}
              sublabel={streak === 1 ? "day" : "days"}
              color="#F59E0B"
              icon={Flame}
              trend={streak > 0 ? "up" : null}
            />
            <StatCard
              label="THIS WEEK"
              value={thisWeekCompleted}
              sublabel={`${thisWeekCreated} created`}
              color="#34D399"
              icon={Calendar}
              trend={thisWeekCompleted > thisWeekCreated ? "up" : "down"}
            />
            <StatCard
              label="ACTIVE NOW"
              value={activeTasks.length}
              sublabel={activeTasks.filter(t => t.riskLevel === "critical").length > 0 
                ? `${activeTasks.filter(t => t.riskLevel === "critical").length} critical` 
                : "All nominal"}
              color="#FCD34D"
              icon={Activity}
            />
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="px-12 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain size={18} color="#34D399" />
            <div>
              <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                AI Insights
              </h2>
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                Behavioral patterns and recommendations based on your data
              </p>
            </div>
          </div>
          <AIInsights tasks={tasks} />
        </div>

        {/* ANALYTICS GRID */}
        <div className="px-12 pb-12">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Weekly Activity */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px" }}>
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={16} color="#F59E0B" />
                <div>
                  <h3 style={{ color: "#FAFAFA", fontSize: "15px", fontWeight: "600" }}>
                    Weekly Activity
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "11px" }}>Last 7 days performance</p>
                </div>
              </div>
              <WeeklyActivity tasks={tasks} />
            </div>

            {/* Risk Distribution */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px" }}>
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={16} color="#EF4444" />
                <div>
                  <h3 style={{ color: "#FAFAFA", fontSize: "15px", fontWeight: "600" }}>
                    Risk Distribution
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "11px" }}>Active mission risk breakdown</p>
                </div>
              </div>
              <RiskDistribution tasks={tasks} />
            </div>

            {/* Category Performance */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px" }}>
              <div className="flex items-center gap-2 mb-5">
                <Target size={16} color="#34D399" />
                <div>
                  <h3 style={{ color: "#FAFAFA", fontSize: "15px", fontWeight: "600" }}>
                    Category Performance
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "11px" }}>Completion rate by category</p>
                </div>
              </div>
              <CategoryChart tasks={tasks} />
            </div>

            {/* Hourly Pattern */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px" }}>
              <div className="flex items-center gap-2 mb-5">
                <Clock size={16} color="#F59E0B" />
                <div>
                  <h3 style={{ color: "#FAFAFA", fontSize: "15px", fontWeight: "600" }}>
                    Productivity Hours
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "11px" }}>When you complete most missions</p>
                </div>
              </div>
              <HourlyPattern tasks={tasks} />
            </div>
          </div>
        </div>

        {/* PREDICTIONS SECTION */}
        <div className="px-12 pb-16">
          <div
            className="p-8"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.05) 0%, transparent 100%)",
              borderRadius: "16px",
              borderLeft: "2px solid #34D399",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid #34D399",
                  borderRadius: "12px",
                }}
              >
                <Sparkles size={20} color="#34D399" />
              </div>
              <div className="flex-1">
                <div style={{ color: "#34D399", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace", marginBottom: "8px" }}>
                  AI FORECAST
                </div>
                <h3 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
                  {tasks.length === 0
                    ? "Insufficient data for predictions"
                    : successRate >= 70
                    ? "You're on track to crush this week"
                    : successRate >= 40
                    ? "Moderate performance trajectory"
                    : "Critical attention needed"}
                </h3>
                <p style={{ color: "#A3A3A3", fontSize: "14px", lineHeight: "1.6", maxWidth: "700px" }}>
                  {tasks.length === 0
                    ? "Complete more missions to unlock AI predictions about your productivity trends and forecast deadline risks."
                    : `Based on your ${total} total missions and ${successRate}% completion rate, here's what I see: ${
                        activeTasks.filter(t => t.riskLevel === "critical").length > 0
                          ? `${activeTasks.filter(t => t.riskLevel === "critical").length} critical mission${activeTasks.filter(t => t.riskLevel === "critical").length > 1 ? "s" : ""} require${activeTasks.filter(t => t.riskLevel === "critical").length === 1 ? "s" : ""} immediate attention. `
                          : ""
                      }${
                        streak > 0
                          ? `You're on a ${streak}-day streak — keep the momentum. `
                          : "Start a daily completion habit to build momentum. "
                      }${
                        thisWeekCompleted > 5
                          ? "Strong week so far."
                          : "Increase weekly throughput for better outcomes."
                      }`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}