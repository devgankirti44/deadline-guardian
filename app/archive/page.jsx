"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect, useMemo } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import {
  Archive, Trophy, Flame, Clock, Target, Brain,
  Search, Filter, Calendar, CheckCircle, Award,
  Zap, Sparkles, TrendingUp, RotateCcw, Trash2,
  Star, Medal, Crown, Rocket, Shield,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── ACHIEVEMENT BADGE ──────────────────────────
const AchievementBadge = ({ achievement }) => {
  const { unlocked, title, description, icon: Icon, color, progress, target } = achievement;
  const percent = Math.min(100, Math.round((progress / target) * 100));

  return (
    <div
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${color}10 0%, transparent 100%)`
          : "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        padding: "20px",
        border: unlocked ? `1px solid ${color}40` : "1px solid rgba(255,255,255,0.05)",
        opacity: unlocked ? 1 : 0.6,
        transition: "all 0.3s",
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: "44px",
            height: "44px",
            background: unlocked ? `${color}20` : "rgba(255,255,255,0.03)",
            border: `1px solid ${unlocked ? color : "rgba(255,255,255,0.1)"}`,
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <Icon size={20} color={unlocked ? color : "#6B7280"} />
          {unlocked && (
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={10} color="#0D0D0D" fill="#10B981" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div style={{
            color: unlocked ? color : "#6B7280",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.15em",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "4px",
          }}>
            {title.toUpperCase()}
          </div>
          <p style={{ color: unlocked ? "#A3A3A3" : "#6B7280", fontSize: "12px", lineHeight: "1.5" }}>
            {description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
            PROGRESS
          </span>
          <span style={{
            color: unlocked ? color : "#6B7280",
            fontSize: "10px",
            fontWeight: "700",
            fontFamily: "JetBrains Mono, monospace",
          }}>
            {progress}/{target}
          </span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: unlocked
                ? `linear-gradient(90deg, ${color}, ${color}80)`
                : "rgba(245,158,11,0.3)",
              borderRadius: "100px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── COMPLETED MISSION ROW ──────────────────────
const CompletedMissionRow = ({ task, onDelete }) => {
  const color = task.riskLevel === "critical" ? "#EF4444"
    : task.riskLevel === "high" ? "#F59E0B"
    : task.riskLevel === "medium" ? "#FCD34D" : "#10B981";

  const completedDate = task.completedAt ? new Date(task.completedAt) : null;
  const formatDate = (d) => {
    if (!d) return "Unknown";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (d) => {
    if (!d) return "";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div
      className="group"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        padding: "14px 20px",
        borderLeft: `2px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "50%",
          }}
        >
          <CheckCircle size={14} color="#10B981" />
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ color: "#E5E5E5", fontSize: "14px", fontWeight: "500", marginBottom: "3px" }}>
            {task.title}
          </div>
          <div className="flex items-center gap-3">
            {task.category && (
              <span style={{ color: "#6B7280", fontSize: "11px" }}>
                {task.category}
              </span>
            )}
            <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
              {formatDate(completedDate)} · {formatTime(completedDate)}
            </span>
            {task.estimatedHours && (
              <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                ~{task.estimatedHours}h
              </span>
            )}
          </div>
        </div>

        <div style={{
          color: color,
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.1em",
          padding: "3px 10px",
          background: `${color}15`,
          borderRadius: "100px",
          fontFamily: "JetBrains Mono, monospace",
        }}>
          {(task.riskLabel || "NOMINAL").toUpperCase()}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            color: "#6B7280",
            background: "rgba(255,255,255,0.04)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          title="Remove from archive"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN ARCHIVE PAGE
// ═══════════════════════════════════════════════
export default function ArchivePage() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  const { tasks, removeTask } = useTasks(user?.uid);
  const completedTasks = tasks.filter(t => t.completed);

  // Calculate stats
  const totalCompleted = completedTasks.length;
  const totalHours = completedTasks.reduce((sum, t) => sum + (t.estimatedHours || 1), 0);

  // Streak
  const calculateStreak = () => {
    const sorted = completedTasks
      .filter(t => t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    if (sorted.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    for (let i = 0; i < 60; i++) {
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

  const currentStreak = calculateStreak();
  
  // Best day
  const completionsByDay = completedTasks.reduce((acc, t) => {
    if (!t.completedAt) return acc;
    const day = new Date(t.completedAt).toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const bestDay = Math.max(...Object.values(completionsByDay), 0);

  // Achievements
  const achievements = useMemo(() => [
    {
      id: "first_mission",
      title: "First Mission",
      description: "Complete your first mission",
      icon: Star,
      color: "#FCD34D",
      progress: Math.min(totalCompleted, 1),
      target: 1,
      unlocked: totalCompleted >= 1,
    },
    {
      id: "five_complete",
      title: "Getting Started",
      description: "Complete 5 missions",
      icon: Target,
      color: "#10B981",
      progress: Math.min(totalCompleted, 5),
      target: 5,
      unlocked: totalCompleted >= 5,
    },
    {
      id: "ten_complete",
      title: "Mission Specialist",
      description: "Complete 10 missions",
      icon: Award,
      color: "#F59E0B",
      progress: Math.min(totalCompleted, 10),
      target: 10,
      unlocked: totalCompleted >= 10,
    },
    {
      id: "twenty_five",
      title: "Operational Veteran",
      description: "Complete 25 missions",
      icon: Medal,
      color: "#F97316",
      progress: Math.min(totalCompleted, 25),
      target: 25,
      unlocked: totalCompleted >= 25,
    },
    {
      id: "fifty",
      title: "Elite Operator",
      description: "Complete 50 missions",
      icon: Trophy,
      color: "#EF4444",
      progress: Math.min(totalCompleted, 50),
      target: 50,
      unlocked: totalCompleted >= 50,
    },
    {
      id: "hundred",
      title: "Mission Commander",
      description: "Complete 100 missions",
      icon: Crown,
      color: "#A855F7",
      progress: Math.min(totalCompleted, 100),
      target: 100,
      unlocked: totalCompleted >= 100,
    },
    {
      id: "three_day_streak",
      title: "Consistency Forming",
      description: "Maintain 3-day completion streak",
      icon: Flame,
      color: "#F59E0B",
      progress: Math.min(currentStreak, 3),
      target: 3,
      unlocked: currentStreak >= 3,
    },
    {
      id: "seven_day_streak",
      title: "Week Warrior",
      description: "Maintain 7-day completion streak",
      icon: Rocket,
      color: "#EF4444",
      progress: Math.min(currentStreak, 7),
      target: 7,
      unlocked: currentStreak >= 7,
    },
    {
      id: "thirty_day_streak",
      title: "Unstoppable",
      description: "Maintain 30-day completion streak",
      icon: Shield,
      color: "#A855F7",
      progress: Math.min(currentStreak, 30),
      target: 30,
      unlocked: currentStreak >= 30,
    },
  ], [totalCompleted, currentStreak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Get categories for filter
  const categories = [...new Set(completedTasks.map(t => t.category).filter(Boolean))];

  // Filter logic
  const filtered = completedTasks
    .filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPeriod !== "all" && t.completedAt) {
        const days = filterPeriod === "today" ? 1 : filterPeriod === "week" ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(t.completedAt) < cutoff) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

  // AI Retrospective
  const retrospective = useMemo(() => {
    if (totalCompleted === 0) {
      return {
        title: "No missions completed yet",
        text: "Complete your first mission to unlock personalized AI retrospective insights.",
      };
    }

    const avgHours = totalCompleted > 0 ? (totalHours / totalCompleted).toFixed(1) : 0;
    const topCategory = Object.entries(
      completedTasks.reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    let title = "Your Mission Profile";
    let text = `You've completed ${totalCompleted} mission${totalCompleted > 1 ? "s" : ""} totaling approximately ${totalHours} hours of focused work. `;
    
    if (topCategory) {
      text += `Your strongest category is "${topCategory[0]}" with ${topCategory[1]} completion${topCategory[1] > 1 ? "s" : ""}. `;
    }
    
    text += `Average mission duration: ${avgHours} hours. `;
    
    if (currentStreak >= 7) {
      text += `Outstanding ${currentStreak}-day streak shows exceptional consistency. `;
    } else if (currentStreak >= 3) {
      text += `You're building momentum with a ${currentStreak}-day streak. `;
    } else if (currentStreak === 0) {
      text += `Restart your daily completion streak today. `;
    }
    
    if (bestDay >= 5) {
      text += `Your peak performance day achieved ${bestDay} completions — proof of your capacity.`;
    }

    return { title, text };
  }, [totalCompleted, totalHours, completedTasks, currentStreak, bestDay]);

  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)", minHeight: "100vh" }}>
        
        {/* HERO */}
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7280" }} />
            <span style={{
              color: "#A3A3A3",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.25em",
              fontWeight: "500",
            }}>
              MISSION ARCHIVE
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
            {totalCompleted} mission{totalCompleted !== 1 ? "s" : ""} <span style={{ color: "#10B981" }}>completed</span>.
          </h1>

          <p style={{ color: "#A3A3A3", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px" }}>
            Your operational history. Review what you've accomplished, unlock achievements, and reflect on your journey.
          </p>
        </div>

        {/* LIFETIME STATS */}
        <div className="px-12 pb-12">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "TOTAL COMPLETED", value: totalCompleted, icon: CheckCircle, color: "#10B981" },
              { label: "TOTAL HOURS", value: `${totalHours}h`, icon: Clock, color: "#F59E0B" },
              { label: "CURRENT STREAK", value: currentStreak, sublabel: currentStreak === 1 ? "day" : "days", icon: Flame, color: "#EF4444" },
              { label: "BEST DAY", value: bestDay, sublabel: bestDay === 1 ? "mission" : "missions", icon: Trophy, color: "#FCD34D" },
            ].map((stat) => (
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
        </div>

        {/* AI RETROSPECTIVE */}
        <div className="px-12 pb-12">
          <div
            className="p-8"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.05) 0%, transparent 100%)",
              borderRadius: "16px",
              borderLeft: "2px solid #A855F7",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid #A855F7",
                  borderRadius: "12px",
                }}
              >
                <Brain size={20} color="#A855F7" />
              </div>
              <div className="flex-1">
                <div style={{ color: "#A855F7", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace", marginBottom: "8px" }}>
                  AI RETROSPECTIVE
                </div>
                <h3 style={{ color: "#FAFAFA", fontSize: "22px", fontWeight: "600", marginBottom: "12px" }}>
                  {retrospective.title}
                </h3>
                <p style={{ color: "#A3A3A3", fontSize: "14px", lineHeight: "1.6", maxWidth: "800px" }}>
                  {retrospective.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="px-12 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy size={18} color="#F59E0B" />
              <div>
                <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                  Achievements
                </h2>
                <p style={{ color: "#6B7280", fontSize: "13px" }}>
                  {unlockedCount} of {achievements.length} unlocked
                </p>
              </div>
            </div>
            <div style={{
              padding: "6px 14px",
              background: "rgba(245,158,11,0.08)",
              borderRadius: "100px",
              border: "1px solid rgba(245,158,11,0.3)",
            }}>
              <span style={{
                color: "#F59E0B",
                fontSize: "12px",
                fontWeight: "700",
                fontFamily: "JetBrains Mono, monospace",
              }}>
                {Math.round((unlockedCount / achievements.length) * 100)}% COMPLETE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

        {/* MISSION LOG */}
        <div className="px-12 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Archive size={18} color="#A3A3A3" />
              <div>
                <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                  Mission Log
                </h2>
                <p style={{ color: "#6B7280", fontSize: "13px" }}>
                  {filtered.length} of {totalCompleted} missions
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center gap-2 px-3 py-2 flex-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
              }}
            >
              <Search size={14} color="#6B7280" />
              <input
                type="text"
                placeholder="Search missions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1"
                style={{
                  color: "#A3A3A3",
                  fontSize: "13px",
                  border: "none",
                }}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "none",
                borderRadius: "10px",
                color: "#A3A3A3",
                fontSize: "12px",
                fontFamily: "JetBrains Mono, monospace",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "none",
                borderRadius: "10px",
                color: "#A3A3A3",
                fontSize: "12px",
                fontFamily: "JetBrains Mono, monospace",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Mission List */}
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: "16px",
              }}
            >
              <Archive size={32} color="#4B5563" className="mx-auto mb-3" />
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                {totalCompleted === 0
                  ? "No completed missions yet. Complete missions to see them here."
                  : "No missions match your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task) => (
                <CompletedMissionRow
                  key={task.id}
                  task={task}
                  onDelete={(id) => {
                    if (confirm("Remove this mission from archive?")) {
                      removeTask(id);
                      toast.success("Mission removed");
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}