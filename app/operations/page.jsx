"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";
import { QuickAddBar } from "@/components/shared/QuickAddBar";
import { FocusMode } from "@/components/focus/FocusMode";
import { TaskModal } from "@/components/shared/TaskModal";
import {
  Layers, Play, Check, Trash2, Cpu, Plus,
  CheckCircle, Target, ChevronDown, ChevronUp,
  Grid3x3, List,
} from "lucide-react";

const PriorityMatrix = ({ tasks, onFocus }) => {
  const now = new Date();
  const categorize = (task) => {
    const hoursLeft = task.deadline ? (new Date(task.deadline) - now) / 3600000 : Infinity;
    const isUrgent = hoursLeft < 48;
    const isImportant = task.riskLevel === "critical" || task.priority === "critical" || task.priority === "high";
    if (isUrgent && isImportant) return "do_first";
    if (!isUrgent && isImportant) return "schedule";
    if (isUrgent && !isImportant) return "delegate";
    return "eliminate";
  };

  const quadrants = [
    { key: "do_first", label: "DO FIRST", sublabel: "Urgent & Important", color: "#EF4444", bg: "rgba(239,68,68,0.06)" },
    { key: "schedule", label: "SCHEDULE", sublabel: "Important, Not Urgent", color: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
    { key: "delegate", label: "DELEGATE", sublabel: "Urgent, Not Important", color: "#FCD34D", bg: "rgba(252,211,77,0.04)" },
    { key: "eliminate", label: "RECONSIDER", sublabel: "Neither Urgent nor Important", color: "#6B7280", bg: "rgba(107,114,128,0.04)" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Target size={18} color="#F59E0B" />
        <div>
          <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>Priority Matrix</h2>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Eisenhower decision framework — AI-categorized</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((q) => {
          const qTasks = tasks.filter(t => categorize(t) === q.key);
          return (
            <div key={q.key} style={{ background: q.bg, borderRadius: "12px", padding: "20px", borderLeft: `2px solid ${q.color}`, minHeight: "180px" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ color: q.color, fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace", marginBottom: "2px" }}>
                    {q.label}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: "11px" }}>{q.sublabel}</div>
                </div>
                <div style={{ color: q.color, fontSize: "24px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
                  {qTasks.length}
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {qTasks.length === 0 ? (
                  <p style={{ color: "#4B5563", fontSize: "12px", fontStyle: "italic" }}>No missions in this quadrant</p>
                ) : (
                  qTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onFocus(task)}
                      className="w-full text-left flex items-center gap-2"
                      style={{ padding: "8px 10px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "none", cursor: "pointer" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: q.color, boxShadow: `0 0 4px ${q.color}` }} />
                      <span style={{ color: "#E5E5E5", fontSize: "12px", flex: 1 }}>
                        {task.title.length > 35 ? task.title.slice(0, 35) + "…" : task.title}
                      </span>
                    </button>
                  ))
                )}
                {qTasks.length > 3 && (
                  <div style={{ color: "#6B7280", fontSize: "11px", textAlign: "center", marginTop: "8px" }}>
                    + {qTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MissionRow = ({ task, onFocus, onComplete, onDelete, onBreakdown }) => {
  const [expanded, setExpanded] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  const color = task.riskLevel === "critical" ? "#EF4444"
    : task.riskLevel === "high" ? "#F59E0B"
    : task.riskLevel === "medium" ? "#FCD34D" : "#10B981";

  const hoursLeft = task.deadline ? Math.round((new Date(task.deadline) - new Date()) / 3600000) : null;

  const handleBreakdown = async () => {
    setBreaking(true);
    const result = await onBreakdown(task);
    if (result?.subtasks) {
      setSubtasks(result.subtasks);
      setExpanded(true);
    }
    setBreaking(false);
  };

  return (
    <div className="group" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "16px 20px", borderLeft: `2px solid ${color}` }}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, border: `1px solid ${color}40` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: "#FAFAFA", fontSize: "14px", fontWeight: "500" }}>{task.title}</span>
            <span style={{ color: color, fontSize: "9px", fontWeight: "700", letterSpacing: "0.1em", padding: "2px 8px", background: `${color}15`, borderRadius: "100px", fontFamily: "JetBrains Mono, monospace" }}>
              {(task.riskLabel || "NOMINAL").toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {hoursLeft !== null && (
              <span style={{ color: hoursLeft < 24 ? "#EF4444" : "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                ⏱ {hoursLeft <= 0 ? "OVERDUE" : hoursLeft < 24 ? `${hoursLeft}h` : `${Math.floor(hoursLeft / 24)}d`}
              </span>
            )}
            <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>~{task.estimatedHours || 1}h</span>
            <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>Risk {task.riskScore || 0}%</span>
            {task.category && <span style={{ color: "#4B5563", fontSize: "11px" }}>{task.category}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onFocus(task)} className="flex items-center gap-1.5" style={{ padding: "8px 14px", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0D0D0D", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace", cursor: "pointer" }}>
            <Play size={11} fill="#0D0D0D" />
            FOCUS
          </button>

          <button onClick={handleBreakdown} disabled={breaking} title="AI Breakdown" className="p-2" style={{ color: "#6B7280", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            {breaking ? <div className="guardian-loader" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <Cpu size={14} />}
          </button>

          {subtasks.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} className="p-2" style={{ color: "#6B7280", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          <button onClick={() => onComplete(task.id)} title="Mark Complete" className="p-2" style={{ color: "#6B7280", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            <Check size={14} />
          </button>

          <button onClick={() => onDelete(task.id)} title="Delete" className="p-2" style={{ color: "#6B7280", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && subtasks.length > 0 && (
        <div className="mt-4 pl-14 space-y-2">
          <div style={{ color: "#F59E0B", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "8px" }}>
            AI BREAKDOWN — {subtasks.length} STEPS
          </div>
          {subtasks.map((st, i) => (
            <div key={st.id || i} className="flex items-start gap-3" style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "6px" }}>
              <span style={{ color: "#F59E0B", fontSize: "11px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace", marginTop: "2px" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div style={{ color: "#E5E5E5", fontSize: "13px", fontWeight: "500" }}>{st.title}</div>
                {st.description && <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "2px" }}>{st.description}</div>}
              </div>
              <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>~{st.estimatedMinutes}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OperationsPage() {
  const [user, setUser] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [viewMode, setViewMode] = useState("matrix");

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  const { tasks, activeTasks, completedToday, addTask, completeTask, removeTask } = useTasks(user?.uid);
  const { breakdownTask } = useAgents(user?.uid);

  const handleSaveTask = async (taskData) => {
    await addTask(taskData);
  };

  const filteredTasks = activeTasks.filter(t => filter === "all" || t.riskLevel === filter);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.riskLevel] || 4) - (order[b.riskLevel] || 4);
    }
    if (sortBy === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const stats = {
    critical: activeTasks.filter(t => t.riskLevel === "critical").length,
    high: activeTasks.filter(t => t.riskLevel === "high").length,
    medium: activeTasks.filter(t => t.riskLevel === "medium").length,
    low: activeTasks.filter(t => t.riskLevel === "low").length,
    total: activeTasks.length,
  };

  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)", minHeight: "100vh" }}>
        
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FCD34D" }} />
            <span style={{ color: "#FCD34D", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.25em", fontWeight: "500" }}>
              OPERATIONS CENTER
            </span>
          </div>

          <h1 style={{ fontSize: "56px", fontWeight: "700", lineHeight: "1.05", letterSpacing: "-0.03em", color: "#FAFAFA", fontFamily: "Inter, sans-serif", marginBottom: "12px" }}>
            {stats.total} active <span style={{ color: "#F59E0B" }}>mission{stats.total !== 1 ? "s" : ""}</span>
          </h1>

          <p style={{ color: "#A3A3A3", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px" }}>
            Manage your operational pipeline. Add, prioritize, and execute missions with AI assistance.
          </p>
        </div>

        <div className="px-12 pb-8">
          <QuickAddBar onAdd={handleSaveTask} />
        </div>

        <div className="px-12 pb-8">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "TOTAL", value: stats.total, color: "#FAFAFA", filterKey: "all" },
              { label: "CRITICAL", value: stats.critical, color: "#EF4444", filterKey: "critical" },
              { label: "HIGH RISK", value: stats.high, color: "#F59E0B", filterKey: "high" },
              { label: "MEDIUM", value: stats.medium, color: "#FCD34D", filterKey: "medium" },
              { label: "NOMINAL", value: stats.low, color: "#10B981", filterKey: "low" },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setFilter(stat.filterKey)}
                style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "16px 20px", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ color: stat.color, fontSize: "28px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace", lineHeight: "1", marginBottom: "6px" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}>
                  {stat.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {viewMode === "matrix" && activeTasks.length > 0 && (
          <div className="px-12">
            <PriorityMatrix tasks={activeTasks} onFocus={setFocusTask} />
          </div>
        )}

        <div className="px-12 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers size={18} color="#F59E0B" />
              <div>
                <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>All Missions</h2>
                <p style={{ color: "#6B7280", fontSize: "13px" }}>
                  {sortedTasks.length} {filter !== "all" ? filter : "active"} missions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                <button onClick={() => setViewMode("matrix")} className="p-1.5" style={{ background: viewMode === "matrix" ? "rgba(245,158,11,0.15)" : "transparent", color: viewMode === "matrix" ? "#F59E0B" : "#6B7280", border: "none", borderRadius: "6px", cursor: "pointer" }} title="Matrix View">
                  <Grid3x3 size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className="p-1.5" style={{ background: viewMode === "list" ? "rgba(245,158,11,0.15)" : "transparent", color: viewMode === "list" ? "#F59E0B" : "#6B7280", border: "none", borderRadius: "6px", cursor: "pointer" }} title="List View">
                  <List size={14} />
                </button>
              </div>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.03)", border: "none", borderRadius: "8px", color: "#A3A3A3", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", cursor: "pointer", outline: "none" }}>
                <option value="priority">Sort: Priority</option>
                <option value="deadline">Sort: Deadline</option>
                <option value="created">Sort: Created</option>
              </select>

              <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2" style={{ padding: "10px 18px", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0D0D0D", border: "none", borderRadius: "100px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                <Plus size={12} />
                NEW MISSION
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { value: "all", label: "All", color: "#FAFAFA" },
              { value: "critical", label: "Critical", color: "#EF4444" },
              { value: "high", label: "High Risk", color: "#F59E0B" },
              { value: "medium", label: "Medium", color: "#FCD34D" },
              { value: "low", label: "Nominal", color: "#10B981" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "6px 16px",
                  background: filter === f.value ? `${f.color}15` : "transparent",
                  border: `1px solid ${filter === f.value ? f.color : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "100px",
                  color: filter === f.value ? f.color : "#6B7280",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {sortedTasks.length === 0 ? (
            <div className="py-16 text-center" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
              <Layers size={32} color="#4B5563" className="mx-auto mb-3" />
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                {filter === "all" ? "No active missions. Add one using the bar above." : `No ${filter} missions found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <MissionRow
                  key={task.id}
                  task={task}
                  onFocus={setFocusTask}
                  onComplete={completeTask}
                  onDelete={removeTask}
                  onBreakdown={breakdownTask}
                />
              ))}
            </div>
          )}

          {completedToday.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <CheckCircle size={14} color="#10B981" />
              <span style={{ color: "#10B981", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                {completedToday.length} MISSION{completedToday.length > 1 ? "S" : ""} COMPLETED TODAY
              </span>
            </div>
          )}
        </div>
      </div>

      {focusTask && (
        <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={completeTask} />
      )}

      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} onSave={handleSaveTask} />
      )}
    </AppShell>
  );
}