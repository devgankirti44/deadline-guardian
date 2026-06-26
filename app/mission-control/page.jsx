"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect, useCallback } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";
import { useReminderEngine } from "@/hooks/useReminderEngine";
import { CosmicVisual } from "@/components/shared/CosmicVisual";
import { FocusMode } from "@/components/focus/FocusMode";
import { QuickAddBar } from "@/components/shared/QuickAddBar";
import PredictionPanel from "@/components/prediction/PredictionPanel";
import {
  Bell,
  Search,
  ArrowRight,
  Activity,
  ChevronDown,
  Sparkles,
  Brain,
  Zap,
  AlertOctagon,
  TrendingUp,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MissionControlPage() {
  const [user, setUser] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const { tasks, activeTasks, completedToday, addTask, completeTask, removeTask } = useTasks(user?.uid);
  
  // ✅ GET ALL AGENT DATA
  const { 
    loading: agentLoading, 
    runAllAgents, 
    orchestratorData,
    riskData,
    crisisData,
    focusData,
    scheduleData,
    lastRun,
  } = useAgents(user?.uid);

  const { isActive: remindersActive } = useReminderEngine(tasks, crisisData, profile);

  const handleScan = useCallback(() => {
    if (user && tasks.length > 0) {
      runAllAgents(tasks, user, completedToday.length);
    } else {
      toast("Deploy missions first", { icon: "⚠️" });
    }
  }, [tasks, user, completedToday.length, runAllAgents]);

  const handleSaveTask = async (taskData) => {
    await addTask(taskData);
    setShowQuickAdd(false);
  };

  const critical = activeTasks.filter(t => t.riskLevel === "critical");
  const high = activeTasks.filter(t => t.riskLevel === "high");

  const threatLevel = critical.length > 0 ? "High" : high.length > 0 ? "Medium" : "Low";
  const threatColor = critical.length > 0 ? "#EF4444" : high.length > 0 ? "#F59E0B" : "#10B981";

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0;

  // ✅ Check if AI data is available
  const hasAIData = orchestratorData || riskData || crisisData || focusData;

  return (
    <AppShell>
      <div className="min-h-full" style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)" }}>
        
        {/* TOP BAR */}
        <div className="px-12 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: "#10B981", opacity: 0.5 }} />
              </div>
              <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", fontWeight: "500" }}>
                SYSTEM STABLE
              </span>
            </div>

            {remindersActive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#A855F7", boxShadow: "0 0 8px #A855F7" }} />
                <span style={{ color: "#A855F7", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", fontWeight: "500" }}>
                  REMINDERS ACTIVE
                </span>
              </div>
            )}

            {/* 🆕 AI Status Indicator */}
            {hasAIData && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3B82F6", boxShadow: "0 0 8px #3B82F6" }} />
                <span style={{ color: "#3B82F6", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", fontWeight: "500" }}>
                  AI INTELLIGENCE LOADED
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", width: "320px" }}>
              <Search size={14} color="#4B5563" />
              <input type="text" placeholder="Search anything..." className="bg-transparent outline-none flex-1" style={{ color: "#A3A3A3", fontSize: "13px", border: "none" }} />
            </div>
            <button className="p-2 transition-colors" style={{ color: "#6B7280" }}>
              <Bell size={18} />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0D0D0D", fontSize: "13px", fontWeight: "700" }}>
              {user?.displayName?.charAt(0)?.toUpperCase() || "K"}
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="px-12 pt-8 pb-16 grid grid-cols-12 gap-8 relative">
          <div className="col-span-6 relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
              <span style={{ color: "#F59E0B", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.25em", fontWeight: "500" }}>
                MISSION CONTROL
              </span>
            </div>

            <h1 style={{ fontSize: "64px", fontWeight: "700", lineHeight: "1.05", letterSpacing: "-0.03em", color: "#FAFAFA", fontFamily: "Inter, sans-serif", marginBottom: "24px" }}>
              I've got your back,{" "}
              <span style={{ color: "#F59E0B" }}>before</span>{" "}
              it's too late.
            </h1>

            <p style={{ fontSize: "18px", color: "#A3A3A3", lineHeight: "1.5", marginBottom: "32px", maxWidth: "440px" }}>
              I analyze. I predict. I act.<br />
              So you never miss what matters.
            </p>

            <button
              onClick={handleScan}
              disabled={agentLoading}
              className="inline-flex items-center gap-3 transition-all"
              style={{
                padding: "14px 28px",
                background: hasAIData ? "rgba(245,158,11,0.08)" : "transparent",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: "100px",
                color: "#F59E0B",
                fontSize: "14px",
                fontWeight: "500",
                cursor: agentLoading ? "wait" : "pointer",
              }}
            >
              {agentLoading ? "AI Analyzing..." : hasAIData ? "Refresh AI Analysis" : "See What's at Risk"}
              <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ background: "rgba(245,158,11,0.15)" }}>
                <ArrowRight size={14} />
              </div>
            </button>

            {lastRun && (
              <p style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", marginTop: "12px" }}>
                LAST SCAN: {new Date(lastRun).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="col-span-6 relative">
            <CosmicVisual criticalCount={critical.length} hasAlerts={critical.length > 0 || high.length > 0} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            🧠 AI INTELLIGENCE BRIEFING (NEW!)
            Shows when agents have responded
            ═══════════════════════════════════════════════ */}
        {hasAIData && (
          <div className="px-12 pb-12">
            <div className="flex items-center gap-2 mb-6">
              <Brain size={16} color="#3B82F6" />
              <div>
                <h2 style={{ color: "#FAFAFA", fontSize: "18px", fontWeight: "600", letterSpacing: "-0.01em" }}>
                  AI Intelligence Briefing
                </h2>
                <p style={{ color: "#6B7280", fontSize: "13px" }}>
                  Live analysis from 5 autonomous Gemini agents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ORCHESTRATOR BRIEFING */}
              {orchestratorData && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 100%)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} color="#3B82F6" />
                    <span style={{ color: "#3B82F6", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                      MISSION BRIEFING
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      padding: "2px 8px",
                      background: orchestratorData.systemStatus === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                      color: orchestratorData.systemStatus === "CRITICAL" ? "#EF4444" : "#10B981",
                      fontSize: "9px",
                      fontWeight: "700",
                      borderRadius: "6px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {orchestratorData.systemStatus}
                    </span>
                  </div>
                  <p style={{ color: "#FAFAFA", fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" }}>
                    {orchestratorData.commandBriefing}
                  </p>
                  {orchestratorData.todayObjective && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                      <div style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em", marginBottom: "4px" }}>
                        TODAY'S OBJECTIVE
                      </div>
                      <p style={{ color: "#D4D4D4", fontSize: "13px" }}>
                        {orchestratorData.todayObjective}
                      </p>
                    </div>
                  )}
                  {orchestratorData.operatorAdvice && (
                    <div className="flex items-start gap-2 mt-3 p-3" style={{ background: "rgba(245,158,11,0.05)", borderRadius: "8px" }}>
                      <Zap size={14} color="#F59E0B" className="flex-shrink-0 mt-0.5" />
                      <p style={{ color: "#FBBF24", fontSize: "12px", lineHeight: "1.5" }}>
                        {orchestratorData.operatorAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FOCUS PULSE */}
              {focusData && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, transparent 100%)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} color="#A855F7" />
                    <span style={{ color: "#A855F7", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                      FOCUS PULSE
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      padding: "2px 8px",
                      background: "rgba(168,85,247,0.15)",
                      color: "#A855F7",
                      fontSize: "9px",
                      fontWeight: "700",
                      borderRadius: "6px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {focusData.energyLevel?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span style={{ color: "#A855F7", fontSize: "42px", fontWeight: "700", lineHeight: "1" }}>
                      {focusData.focusScore}
                    </span>
                    <span style={{ color: "#6B7280", fontSize: "13px" }}>focus score</span>
                  </div>
                  <p style={{ color: "#D4D4D4", fontSize: "13px", lineHeight: "1.5", marginBottom: "12px" }}>
                    {focusData.recommendation}
                  </p>
                  {focusData.focusTips?.length > 0 && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                      <div style={{ color: "#6B7280", fontSize: "10px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em", marginBottom: "8px" }}>
                        FOCUS TIPS
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {focusData.focusTips.slice(0, 3).map((tip, i) => (
                          <li key={i} style={{ color: "#A3A3A3", fontSize: "12px", paddingLeft: "12px", position: "relative", marginBottom: "4px" }}>
                            <span style={{ position: "absolute", left: 0, color: "#A855F7" }}>•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* RISK ANALYSIS SUMMARY */}
              {riskData?.risks?.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertOctagon size={14} color="#EF4444" />
                    <span style={{ color: "#EF4444", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                      RISK ANALYSIS
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      padding: "2px 8px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      fontSize: "9px",
                      fontWeight: "700",
                      borderRadius: "6px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {riskData.criticalCount || 0} CRITICAL
                    </span>
                  </div>
                  <div className="space-y-2">
                    {riskData.risks.slice(0, 3).map((risk, i) => {
                      const task = tasks.find(t => t.id === risk.taskId);
                      if (!task) return null;
                      const color = risk.riskLevel === "critical" ? "#EF4444" : risk.riskLevel === "high" ? "#F59E0B" : "#10B981";
                      return (
                        <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "10px 12px", borderRadius: "8px", borderLeft: `2px solid ${color}` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ color: "#FAFAFA", fontSize: "12px", fontWeight: "600" }}>
                              {task.title}
                            </span>
                            <span style={{ color, fontSize: "12px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
                              {risk.riskScore}%
                            </span>
                          </div>
                          <p style={{ color: "#A3A3A3", fontSize: "11px" }}>
                            {risk.primaryReason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCHEDULE PREVIEW */}
              {scheduleData?.timeline?.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 100%)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} color="#10B981" />
                    <span style={{ color: "#10B981", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                      TODAY'S SCHEDULE
                    </span>
                  </div>
                  {scheduleData.todayFocus && (
                    <p style={{ color: "#FAFAFA", fontSize: "13px", marginBottom: "12px" }}>
                      <span style={{ color: "#10B981", fontWeight: "600" }}>Focus:</span> {scheduleData.todayFocus}
                    </p>
                  )}
                  <div className="space-y-1">
                    {scheduleData.timeline.slice(0, 4).map((block, i) => (
                      <div key={i} className="flex items-center gap-3 py-1">
                        <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", minWidth: "80px" }}>
                          {block.startTime} - {block.endTime}
                        </span>
                        <span style={{ color: "#D4D4D4", fontSize: "12px", flex: 1 }}>
                          {block.taskTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TODAY'S SITUATION */}
        <div className="px-12 pb-12">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={16} color="#F59E0B" />
            <div>
              <h2 style={{ color: "#FAFAFA", fontSize: "18px", fontWeight: "600", letterSpacing: "-0.01em" }}>
                Today's Situation
              </h2>
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                Real-time overview of your mission
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-12">
            <div>
              <div style={{ color: "#6B7280", fontSize: "12px", marginBottom: "12px" }}>
                Deadline Threat Level
              </div>
              <div className="flex items-end gap-3">
                <div style={{ fontSize: "42px", fontWeight: "600", color: threatColor, lineHeight: "1" }}>
                  {threatLevel}
                </div>
                <svg width="60" height="32" viewBox="0 0 60 32" style={{ marginBottom: "6px" }}>
                  <path d="M0,20 L8,18 L12,8 L18,24 L22,12 L28,16 L32,4 L38,20 L42,14 L50,22 L60,18" stroke={threatColor} strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "8px" }}>
                {critical.length} deadline{critical.length !== 1 ? "s" : ""} at risk
              </p>
            </div>

            <div>
              <div style={{ color: "#6B7280", fontSize: "12px", marginBottom: "12px" }}>
                Active Missions
              </div>
              <div className="flex items-end gap-3">
                <div style={{ fontSize: "42px", fontWeight: "600", color: "#F59E0B", lineHeight: "1" }}>
                  {activeTasks.length}
                </div>
              </div>
              <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "8px" }}>
                Tasks awaiting action
              </p>
            </div>

            <div>
              <div style={{ color: "#6B7280", fontSize: "12px", marginBottom: "12px" }}>
                Mission Progress
              </div>
              <div className="flex items-end gap-3">
                <div style={{ fontSize: "42px", fontWeight: "600", color: "#10B981", lineHeight: "1" }}>
                  {completionRate}%
                </div>
              </div>
              <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "8px" }}>
                {completionRate > 50 ? "Keep pushing, you're doing great." : "Time to accelerate."}
              </p>
            </div>
          </div>
        </div>

        {/* PREDICTION PANEL */}
        <div className="px-12 pb-12">
          <PredictionPanel tasks={tasks} onFocus={setFocusTask} onComplete={completeTask} onDelete={removeTask} />
        </div>

        <div className="px-12 pb-16">
          <div className="flex justify-center">
            <button onClick={() => setShowQuickAdd(!showQuickAdd)} className="opacity-50 hover:opacity-100 transition-opacity" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {showQuickAdd && (
          <div className="px-12 pb-12">
            <QuickAddBar onAdd={handleSaveTask} />
          </div>
        )}
      </div>

      {focusTask && <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={completeTask} />}
    </AppShell>
  );
}