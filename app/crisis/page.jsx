"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect, useCallback } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useTasks } from "@/hooks/useTasks";
import { runRecoveryAgent, runConflictAgent } from "@/lib/gemini";
import { withCache, clearCacheEntry } from "@/lib/aiCacheManager";
import { useVoice } from "@/hooks/useVoice";
import EmailDrafter from "@/components/email/EmailDrafter";
import {
  AlertOctagon,
  Zap,
  Shield,
  Activity,
  Clock,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PlayCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CrisisPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recoveryPlans, setRecoveryPlans] = useState({});
  const [conflictData, setConflictData] = useState(null);
  const [analyzingTaskId, setAnalyzingTaskId] = useState(null);
  const [analyzingConflicts, setAnalyzingConflicts] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState({});
  const [hasSpoken, setHasSpoken] = useState(false);
  const [emailDrafterTask, setEmailDrafterTask] = useState(null);
  const voice = useVoice();

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const { tasks, activeTasks, completeTask, loading: tasksLoading } = useTasks(user?.uid);

  const isLoading = authLoading || tasksLoading || !user;

  const criticalMissions = activeTasks.filter(t =>
    t.riskLevel === "critical" || (t.riskScore && t.riskScore > 70)
  );

  useEffect(() => {
    if (isLoading || hasSpoken) return;

    const timer = setTimeout(() => {
      if (criticalMissions.length > 0) {
        voice.speak(
          `Entering Crisis Center. ${criticalMissions.length} mission${criticalMissions.length > 1 ? 's' : ''} at critical risk. Recommend immediate action.`,
          { rate: 0.95 }
        );
      } else {
        voice.speak("Crisis Center online. No critical threats detected. Systems nominal.");
      }
      setHasSpoken(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, criticalMissions.length, hasSpoken, voice]);

  // ─── CACHED RECOVERY ANALYSIS ─────────────────────
  const analyzeMission = async (task, forceRefresh = false) => {
    if (!user?.uid) {
      toast.error("Please sign in first");
      return;
    }

    setAnalyzingTaskId(task.id);
    voice.speak(`Analyzing ${task.title}. Generating recovery protocols.`, { rate: 1.0 });
    toast.loading(`AI analyzing ${task.title}...`, { id: "recovery" });

    const cacheInputs = {
      taskId: task.id,
      version: "recovery-v2",
    };

    try {
      // If forcing refresh, clear cache first
      if (forceRefresh) {
        await clearCacheEntry(user.uid, "recovery", cacheInputs);
      }

      const plan = await withCache(
        user.uid,
        "recovery",
        cacheInputs,
        () => runRecoveryAgent(task, tasks)
      );

      if (plan) {
        setRecoveryPlans(prev => ({ ...prev, [task.id]: plan }));

        voice.speak(
          `Recovery plan ready. ${plan.failureAnalysis?.probability || 'High'} percent failure probability. ${plan.recoveryStrategies?.length || 3} strategies available.`,
          { rate: 0.95 }
        );

        toast.success("Recovery plan loaded", { id: "recovery" });
      } else {
        toast.error("Could not generate plan", { id: "recovery" });
      }
    } catch (error) {
      console.error("Recovery error:", error);
      toast.error("AI unavailable. Try again later.", { id: "recovery" });
    } finally {
      setAnalyzingTaskId(null);
    }
  };

  // ─── CACHED CONFLICT ANALYSIS ─────────────────────
  const analyzeConflicts = async (forceRefresh = false) => {
    if (activeTasks.length === 0) {
      toast("No missions to analyze", { icon: "⚠️" });
      return;
    }
    if (!user?.uid) {
      toast.error("Please sign in first");
      return;
    }

    setAnalyzingConflicts(true);
    voice.speak("Detecting workload conflicts. Analyzing schedule.", { rate: 1.0 });
    toast.loading("Detecting workload conflicts...", { id: "conflict" });

    // Fingerprint = task list (changes when tasks change)
    const cacheInputs = {
      taskFingerprint: activeTasks
        .map(t => `${t.id}:${t.deadline}:${t.estimatedHours}`)
        .sort()
        .join("|"),
      version: "conflict-v2",
    };

    try {
      if (forceRefresh) {
        await clearCacheEntry(user.uid, "conflict", cacheInputs);
      }

      const data = await withCache(
        user.uid,
        "conflict",
        cacheInputs,
        () => runConflictAgent(activeTasks)
      );

      if (data) {
        setConflictData(data);

        if (data.overloadStatus === "CRITICAL") {
          voice.warning(
            `Critical workload alert. ${data.overloadHours} hour overload detected.`
          );
        } else if (data.overloadStatus === "WARNING") {
          voice.speak(
            `Warning status. ${data.conflicts?.length || 0} conflict${data.conflicts?.length !== 1 ? 's' : ''} detected.`,
            { rate: 0.95 }
          );
        } else {
          voice.speak("Workload analysis complete. Schedule is balanced.");
        }

        toast.success("Conflict analysis complete", { id: "conflict" });
      } else {
        toast.error("Could not analyze", { id: "conflict" });
      }
    }  catch (error) {
      console.error("Recovery error:", error);
      
      // Voice warning for quota/API issues
      const errorMsg = error.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("quota")) {
        voice.warning("API quota exceeded. Please wait or use a new API key.");
        toast.error("API quota exceeded. Retry in a minute.", { id: "recovery" });
      } else if (errorMsg.includes("503") || errorMsg.includes("high demand")) {
        voice.warning("AI service temporarily overloaded.");
        toast.error("AI overloaded. Try again in 30 seconds.", { id: "recovery" });
      } else if (errorMsg.includes("404")) {
        voice.warning("AI model not found. Check configuration.");
        toast.error("Model error. Contact developer.", { id: "recovery" });
      } else {
        voice.warning("Recovery plan generation failed.");
        toast.error("AI unavailable. Try again later.", { id: "recovery" });
      }
    } finally {
      setAnalyzingConflicts(false);
    }
  };

  const executeStrategy = async (taskId, strategy) => {
    voice.speak(
      `Executing ${strategy.name}. ${strategy.successRate} percent success probability.`,
      { rate: 0.95 }
    );

    toast.success(`Executing: ${strategy.name}`, {
      duration: 4000,
      icon: "🚀",
    });
    setSelectedStrategy(prev => ({ ...prev, [taskId]: strategy }));
  };

  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)", minHeight: "100vh" }}>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "100vh" }}>
            <div className="guardian-loader mb-4" style={{ width: 40, height: 40 }} />
            <span style={{
              color: "#6B7280",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.2em"
            }}>
              INITIALIZING CRISIS CENTER...
            </span>
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <div className="px-12 pt-12 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: criticalMissions.length > 0 ? "#EF4444" : "#10B981",
                      boxShadow: criticalMissions.length > 0
                        ? "0 0 16px #EF4444, 0 0 32px rgba(239,68,68,0.4)"
                        : "0 0 16px #10B981",
                    }}
                  />
                  {criticalMissions.length > 0 && (
                    <div
                      className="absolute inset-0 w-3 h-3 rounded-full animate-ping"
                      style={{ background: "#EF4444", opacity: 0.4 }}
                    />
                  )}
                </div>
                <span
                  style={{
                    color: criticalMissions.length > 0 ? "#EF4444" : "#10B981",
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace",
                    letterSpacing: "0.25em",
                    fontWeight: "600",
                  }}
                >
                  {criticalMissions.length > 0 ? "EMERGENCY PROTOCOLS ACTIVE" : "ALL SYSTEMS NOMINAL"}
                </span>
              </div>

              <h1
                style={{
                  fontSize: "56px",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "-0.03em",
                  color: "#FAFAFA",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "16px",
                }}
              >
                {criticalMissions.length > 0 ? (
                  <>
                    {criticalMissions.length} mission{criticalMissions.length > 1 ? "s" : ""}{" "}
                    <span style={{ color: "#EF4444" }}>at risk</span>
                  </>
                ) : (
                  <>
                    Crisis <span style={{ color: "#10B981" }}>averted</span>.
                  </>
                )}
              </h1>

              <p
                style={{
                  fontSize: "16px",
                  color: "#A3A3A3",
                  lineHeight: "1.6",
                  maxWidth: "600px",
                }}
              >
                {criticalMissions.length > 0 ? (
                  <>
                    I've detected potential deadline failures. Let me generate recovery plans
                    with success probability analysis.
                  </>
                ) : (
                  <>
                    No critical threats detected. All missions are within acceptable risk parameters.
                    Stay focused — I'm watching.
                  </>
                )}
              </p>
            </div>

            {/* WORKLOAD CONFLICT DETECTION */}
            <div className="px-12 pb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity size={18} color="#F59E0B" />
                  <div>
                    <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                      Workload Analysis
                    </h2>
                    <p style={{ color: "#6B7280", fontSize: "13px" }}>
                      AI-powered conflict detection across your schedule
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {conflictData && (
                    <button
                      onClick={() => analyzeConflicts(true)}
                      disabled={analyzingConflicts}
                      className="flex items-center gap-2 transition-all"
                      style={{
                        padding: "10px 16px",
                        background: "transparent",
                        border: "1px solid rgba(107,114,128,0.4)",
                        borderRadius: "100px",
                        color: "#9CA3AF",
                        fontSize: "11px",
                        fontWeight: "500",
                        cursor: analyzingConflicts ? "wait" : "pointer",
                      }}
                      title="Force fresh AI analysis"
                    >
                      <RefreshCw size={11} />
                      Refresh
                    </button>
                  )}

                  <button
                    onClick={() => analyzeConflicts(false)}
                    disabled={analyzingConflicts || activeTasks.length === 0}
                    className="flex items-center gap-2 transition-all"
                    style={{
                      padding: "10px 20px",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      borderRadius: "100px",
                      color: "#F59E0B",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: analyzingConflicts ? "wait" : "pointer",
                      opacity: activeTasks.length === 0 ? 0.4 : 1,
                    }}
                  >
                    {analyzingConflicts ? (
                      <>
                        <div className="guardian-loader" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Run Conflict Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>

              {conflictData ? (
                <div>
                  <div className="grid grid-cols-4 gap-8 mb-8">
                    <div>
                      <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "8px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                        TOTAL WORKLOAD
                      </div>
                      <div style={{ color: "#F59E0B", fontSize: "36px", fontWeight: "700", lineHeight: "1" }}>
                        {conflictData.totalWorkloadHours}h
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "8px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                        AVAILABLE TIME
                      </div>
                      <div style={{ color: "#10B981", fontSize: "36px", fontWeight: "700", lineHeight: "1" }}>
                        {conflictData.availableHours}h
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "8px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                        OVERLOAD
                      </div>
                      <div style={{ color: conflictData.overloadHours > 0 ? "#EF4444" : "#10B981", fontSize: "36px", fontWeight: "700", lineHeight: "1" }}>
                        {conflictData.overloadHours > 0 ? "+" : ""}{conflictData.overloadHours}h
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "8px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                        STATUS
                      </div>
                      <div style={{
                        color: conflictData.overloadStatus === "CRITICAL" ? "#EF4444"
                          : conflictData.overloadStatus === "WARNING" ? "#F59E0B" : "#10B981",
                        fontSize: "20px",
                        fontWeight: "700",
                        fontFamily: "JetBrains Mono, monospace",
                        letterSpacing: "0.05em"
                      }}>
                        {conflictData.overloadStatus}
                      </div>
                    </div>
                  </div>

                  {conflictData.criticalWarning && (
                    <div
                      className="mb-6 p-5 flex items-start gap-3"
                      style={{
                        background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)",
                        borderLeft: "2px solid #EF4444",
                      }}
                    >
                      <AlertOctagon size={20} color="#EF4444" className="flex-shrink-0 mt-0.5" />
                      <div>
                        <div style={{ color: "#EF4444", fontSize: "11px", fontWeight: "600", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "6px" }}>
                          CRITICAL WORKLOAD ALERT
                        </div>
                        <p style={{ color: "#FAFAFA", fontSize: "14px", lineHeight: "1.6" }}>
                          {conflictData.criticalWarning}
                        </p>
                      </div>
                    </div>
                  )}

                  {conflictData.conflicts?.length > 0 && (
                    <div className="space-y-4">
                      {conflictData.conflicts.map((conflict, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "12px",
                            padding: "20px",
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex items-center justify-center flex-shrink-0"
                              style={{
                                width: "44px",
                                height: "44px",
                                background: conflict.severity === "HIGH" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                                border: `1px solid ${conflict.severity === "HIGH" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                                borderRadius: "10px",
                              }}
                            >
                              <AlertTriangle size={18} color={conflict.severity === "HIGH" ? "#EF4444" : "#F59E0B"} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{ color: conflict.severity === "HIGH" ? "#EF4444" : "#F59E0B", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                                  [{conflict.type}] · {conflict.severity}
                                </span>
                              </div>
                              <p style={{ color: "#FAFAFA", fontSize: "14px", lineHeight: "1.6", marginBottom: "8px" }}>
                                {conflict.description}
                              </p>
                              <div className="flex items-start gap-2 mt-3">
                                <ArrowRight size={12} color="#10B981" className="mt-1 flex-shrink-0" />
                                <span style={{ color: "#10B981", fontSize: "13px", fontWeight: "500" }}>
                                  {conflict.resolution}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                  <Activity size={32} color="#4B5563" className="mx-auto mb-3" />
                  <p style={{ color: "#6B7280", fontSize: "14px" }}>
                    Click "Run Conflict Analysis" to detect scheduling issues
                  </p>
                </div>
              )}
            </div>

            {/* AT-RISK MISSIONS */}
            <div className="px-12 pb-16">
              <div className="flex items-center gap-3 mb-6">
                <AlertOctagon size={18} color="#EF4444" />
                <div>
                  <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                    Missions in Crisis
                  </h2>
                  <p style={{ color: "#6B7280", fontSize: "13px" }}>
                    AI-generated recovery protocols with success probability
                  </p>
                </div>
              </div>

              {criticalMissions.length === 0 ? (
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
                    No Missions in Crisis
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "14px" }}>
                    All missions are within acceptable risk parameters.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {criticalMissions.map((task) => {
                    const plan = recoveryPlans[task.id];
                    const isAnalyzing = analyzingTaskId === task.id;
                    const accepted = selectedStrategy[task.id];

                    return (
                      <div
                        key={task.id}
                        style={{
                          background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, transparent 100%)",
                          borderRadius: "16px",
                          padding: "24px",
                          borderLeft: "2px solid #EF4444",
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span style={{ color: "#EF4444", fontSize: "10px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace" }}>
                                CRITICAL RISK · {task.riskScore || 0}%
                              </span>
                            </div>
                            <h3 style={{ color: "#FAFAFA", fontSize: "22px", fontWeight: "600", marginBottom: "6px" }}>
                              {task.title}
                            </h3>
                            {task.deadline && (
                              <p style={{ color: "#A3A3A3", fontSize: "13px" }}>
                                ⏱ {(() => {
                                  const h = Math.round((new Date(task.deadline) - new Date()) / 3600000);
                                  return h <= 0 ? "OVERDUE" : h < 24 ? `${h} hours remaining` : `${Math.floor(h/24)} days remaining`;
                                })()}
                                {" · "}
                                {task.estimatedHours}h estimated work
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {/* DRAFT EMAIL */}
                            <button
                              onClick={() => setEmailDrafterTask(task)}
                              className="flex items-center gap-2 transition-all"
                              style={{
                                padding: "10px 18px",
                                background: "transparent",
                                border: "1px solid #A855F7",
                                borderRadius: "100px",
                                color: "#A855F7",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <Mail size={12} />
                              Draft Email
                            </button>

                            {/* REFRESH (if plan exists) */}
                            {plan && (
                              <button
                                onClick={() => analyzeMission(task, true)}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 transition-all"
                                style={{
                                  padding: "10px 18px",
                                  background: "transparent",
                                  border: "1px solid rgba(107,114,128,0.4)",
                                  borderRadius: "100px",
                                  color: "#9CA3AF",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  cursor: isAnalyzing ? "wait" : "pointer",
                                }}
                                title="Force fresh AI analysis"
                              >
                                <RefreshCw size={12} />
                                Refresh Plan
                              </button>
                            )}

                            {/* GENERATE RECOVERY PLAN */}
                            {!plan && (
                              <button
                                onClick={() => analyzeMission(task, false)}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 transition-all"
                                style={{
                                  padding: "10px 18px",
                                  background: "#EF4444",
                                  border: "none",
                                  borderRadius: "100px",
                                  color: "#FFFFFF",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: isAnalyzing ? "wait" : "pointer",
                                  boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
                                }}
                              >
                                {isAnalyzing ? (
                                  <>
                                    <div className="guardian-loader" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                    AI Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={12} />
                                    Generate Recovery Plan
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {plan && (
                          <div className="mt-6 space-y-6">
                            <div className="p-5" style={{ background: "rgba(0,0,0,0.4)", borderRadius: "12px" }}>
                              <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={14} color="#EF4444" />
                                <span style={{ color: "#EF4444", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                                  FAILURE PREDICTION
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-6 mb-4">
                                <div>
                                  <div style={{ color: "#6B7280", fontSize: "10px", marginBottom: "4px" }}>
                                    Failure Probability
                                  </div>
                                  <div style={{ color: "#EF4444", fontSize: "32px", fontWeight: "700", lineHeight: "1" }}>
                                    {plan.failureAnalysis.probability}%
                                  </div>
                                </div>
                                <div>
                                  <div style={{ color: "#6B7280", fontSize: "10px", marginBottom: "4px" }}>
                                    Current Success Rate
                                  </div>
                                  <div style={{ color: "#F59E0B", fontSize: "32px", fontWeight: "700", lineHeight: "1" }}>
                                    {plan.failureAnalysis.currentSuccessRate}%
                                  </div>
                                </div>
                                <div>
                                  <div style={{ color: "#6B7280", fontSize: "10px", marginBottom: "4px" }}>
                                    Time Shortage
                                  </div>
                                  <div style={{ color: "#EF4444", fontSize: "20px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
                                    {plan.failureAnalysis.timeShortage}
                                  </div>
                                </div>
                              </div>
                              <p style={{ color: "#FAFAFA", fontSize: "14px", marginBottom: "8px" }}>
                                <span style={{ color: "#EF4444", fontWeight: "600" }}>Primary Reason:</span>{" "}
                                {plan.failureAnalysis.primaryReason}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Shield size={14} color="#10B981" />
                                <span style={{ color: "#10B981", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                                  RECOVERY STRATEGIES
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                {plan.recoveryStrategies.map((strategy, i) => {
                                  const isRecommended = plan.recommendedStrategy === strategy.name;
                                  const isSelected = accepted?.name === strategy.name;
                                  const stratColor = strategy.type === "aggressive" ? "#EF4444"
                                    : strategy.type === "balanced" ? "#F59E0B" : "#10B981";

                                  return (
                                    <div
                                      key={i}
                                      className="p-5 transition-all"
                                      style={{
                                        background: isSelected
                                          ? `linear-gradient(135deg, ${stratColor}15 0%, transparent 100%)`
                                          : "rgba(0,0,0,0.3)",
                                        borderRadius: "12px",
                                        border: isSelected ? `1px solid ${stratColor}` : "1px solid rgba(255,255,255,0.05)",
                                        position: "relative",
                                      }}
                                    >
                                      {isRecommended && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "12px",
                                            padding: "3px 10px",
                                            background: "#10B981",
                                            color: "#0D0D0D",
                                            fontSize: "9px",
                                            fontWeight: "700",
                                            letterSpacing: "0.1em",
                                            fontFamily: "JetBrains Mono, monospace",
                                            borderRadius: "100px",
                                          }}
                                        >
                                          AI RECOMMENDED
                                        </div>
                                      )}
                                      <div style={{ color: stratColor, fontSize: "11px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "8px" }}>
                                        {strategy.name}
                                      </div>
                                      <div className="flex items-baseline gap-2 mb-3">
                                        <span style={{ color: stratColor, fontSize: "36px", fontWeight: "700", lineHeight: "1" }}>
                                          {strategy.successRate}%
                                        </span>
                                        <span style={{ color: "#6B7280", fontSize: "11px" }}>success</span>
                                      </div>
                                      <p style={{ color: "#A3A3A3", fontSize: "12px", lineHeight: "1.5", marginBottom: "12px" }}>
                                        {strategy.description}
                                      </p>

                                      {/* SHOW STEPS */}
                                      {strategy.steps && strategy.steps.length > 0 && (
                                        <div className="mb-3">
                                          <div style={{ color: "#6B7280", fontSize: "9px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "6px" }}>
                                            ACTION STEPS
                                          </div>
                                          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                            {strategy.steps.slice(0, 4).map((step, si) => (
                                              <li key={si} style={{ color: "#D4D4D4", fontSize: "11px", lineHeight: "1.5", paddingLeft: "16px", position: "relative", marginBottom: "4px" }}>
                                                <span style={{ position: "absolute", left: 0, color: stratColor }}>→</span>
                                                {step}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      <button
                                        onClick={() => executeStrategy(task.id, strategy)}
                                        className="w-full flex items-center justify-center gap-2 transition-all"
                                        style={{
                                          padding: "10px",
                                          background: isSelected ? stratColor : "transparent",
                                          border: `1px solid ${stratColor}`,
                                          borderRadius: "8px",
                                          color: isSelected ? "#0D0D0D" : stratColor,
                                          fontSize: "11px",
                                          fontWeight: "600",
                                          cursor: "pointer",
                                          marginTop: "8px",
                                        }}
                                      >
                                        {isSelected ? (
                                          <>
                                            <CheckCircle size={12} />
                                            Strategy Active
                                          </>
                                        ) : (
                                          <>
                                            <PlayCircle size={12} />
                                            Execute Plan
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {plan.immediateNextAction && (
                              <div
                                className="p-5 flex items-start gap-3"
                                style={{
                                  background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 100%)",
                                  borderRadius: "12px",
                                  borderLeft: "2px solid #F59E0B",
                                }}
                              >
                                <Zap size={18} color="#F59E0B" className="flex-shrink-0 mt-0.5" />
                                <div>
                                  <div style={{ color: "#F59E0B", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "6px" }}>
                                    DO THIS RIGHT NOW
                                  </div>
                                  <p style={{ color: "#FAFAFA", fontSize: "14px", lineHeight: "1.6" }}>
                                    {plan.immediateNextAction}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {emailDrafterTask && (
        <EmailDrafter
          task={emailDrafterTask}
          user={user}
          onClose={() => setEmailDrafterTask(null)}
        />
      )}
    </AppShell>
  );
}