"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  runRiskAgent,
  runCrisisAgent,
  runScheduleAgent,
  runOrchestrator,
  runFocusAgent,
  runBreakdownAgent,
  runRecoveryAgent,
  runConflictAgent,
  runEmailDrafterAgent,
} from "@/lib/gemini";
import { withCache } from "@/lib/aiCacheManager";
import { saveAICache, getAICache } from "@/lib/firebase";
import toast from "react-hot-toast";

export const useAgents = (userId) => {
  const [orchestratorData, setOrchestratorData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [crisisData, setCrisisData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [focusData, setFocusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const runningRef = useRef(false);

  // Load cached AI data on mount
  useEffect(() => {
    if (!userId) return;
    
    const loadCache = async () => {
      const { data } = await getAICache(userId);
      if (data) {
        if (data.orchestratorData) setOrchestratorData(data.orchestratorData);
        if (data.riskData) setRiskData(data.riskData);
        if (data.crisisData) setCrisisData(data.crisisData);
        if (data.scheduleData) setScheduleData(data.scheduleData);
        if (data.focusData) setFocusData(data.focusData);
        if (data.updatedAt) setLastRun(data.updatedAt);
      }
    };
    loadCache();
  }, [userId]);

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Run all agents with smart caching
  const runAllAgents = useCallback(async (tasks, user, completedToday = 0) => {
    if (runningRef.current || !tasks || tasks.length === 0) return;
    runningRef.current = true;
    setLoading(true);
    toast.loading("AI scanning (cached responses will be instant)...", { id: "ai-scan" });

    let successCount = 0;
    let failCount = 0;
    let cacheHits = 0;
    let risks = null, orchestrator = null, focus = null, crises = null, schedule = null;

    // Hash for input fingerprinting (cache key)
    const taskFingerprint = tasks
      .filter(t => !t.completed)
      .map(t => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline,
        riskLevel: t.riskLevel,
      }));

    try {
      // ─── Agent 1: Risk Prediction (CACHED) ───
      console.log("🤖 Agent 1/5: Risk Prediction...");
      try {
        risks = await withCache(
          userId,
          "risk",
          { tasks: taskFingerprint },
          () => runRiskAgent(tasks)
        );
        if (risks) {
          setRiskData(risks);
          successCount++;
        }
      } catch (e) {
        failCount++;
        console.log("❌ Risk Agent failed:", e.message);
      }
      
      await wait(2000); // Small delay between agents
      
      // ─── Agent 2: Orchestrator (CACHED) ───
      console.log("🤖 Agent 2/5: Orchestrator...");
      try {
        orchestrator = await withCache(
          userId,
          "orchestrator",
          { tasks: taskFingerprint, userName: user?.displayName },
          () => runOrchestrator(tasks, { name: user?.displayName })
        );
        if (orchestrator) {
          setOrchestratorData(orchestrator);
          successCount++;
        }
      } catch (e) {
        failCount++;
        console.log("❌ Orchestrator failed:", e.message);
      }
      
      await wait(2000);
      
      // ─── Agent 3: Focus Pulse (CACHED, 15 min) ───
      console.log("🤖 Agent 3/5: Focus Pulse...");
      try {
        const focusHour = new Date().getHours();
        focus = await withCache(
          userId,
          "focus",
          { 
            taskCount: tasks.filter(t => !t.completed).length,
            completedToday,
            hour: focusHour,
          },
          () => runFocusAgent(tasks, completedToday)
        );
        if (focus) {
          setFocusData(focus);
          successCount++;
        }
      } catch (e) {
        failCount++;
        console.log("❌ Focus Agent failed:", e.message);
      }
      
      await wait(2000);
      
      // ─── Agent 4: Crisis Detection (CACHED) ───
      console.log("🤖 Agent 4/5: Crisis Detection...");
      try {
        crises = await withCache(
          userId,
          "crisis",
          { tasks: taskFingerprint, risks },
          () => runCrisisAgent(tasks, risks)
        );
        if (crises) {
          setCrisisData(crises);
          successCount++;
        }
      } catch (e) {
        failCount++;
        console.log("❌ Crisis Agent failed:", e.message);
      }
      
      await wait(2000);
      
      // ─── Agent 5: Schedule (CACHED) ───
      console.log("🤖 Agent 5/5: Schedule...");
      try {
        schedule = await withCache(
          userId,
          "schedule",
          { tasks: taskFingerprint, risks },
          () => runScheduleAgent(tasks, risks)
        );
        if (schedule) {
          setScheduleData(schedule);
          successCount++;
        }
      } catch (e) {
        failCount++;
        console.log("❌ Schedule Agent failed:", e.message);
      }
      
      // Save aggregated cache (for instant page load next time)
      if (userId && successCount > 0) {
        await saveAICache(userId, {
          orchestratorData: orchestrator,
          riskData: risks,
          crisisData: crises,
          scheduleData: schedule,
          focusData: focus,
        });
      }
      
      console.log(`✅ Scan complete: ${successCount}/5 agents succeeded`);
      setLastRun(new Date());
      
      if (failCount === 0) {
        toast.success(`All 5 AI agents responded successfully`, { id: "ai-scan" });
      } else if (successCount > 0) {
        toast.success(`${successCount}/5 agents responded (others cached or quota-limited)`, { id: "ai-scan" });
      } else {
        toast.error(`AI quota exceeded. Cached data shown.`, { id: "ai-scan" });
      }
    } catch (error) {
      console.error("Agent system error:", error);
      toast.error("Agent system error. Check console.", { id: "ai-scan" });
    } finally {
      setLoading(false);
      runningRef.current = false;
    }
  }, [userId]);

  // Breakdown agent (CACHED for 24 hours - task structure rarely changes)
  const breakdownTask = useCallback(async (task) => {
    if (!userId) return null;
    
    try {
      const result = await withCache(
        userId,
        "breakdown",
        { 
          taskId: task.id, 
          title: task.title,
          estimatedHours: task.estimatedHours,
        },
        () => runBreakdownAgent(task)
      );
      return result;
    } catch (err) {
      console.error("Breakdown failed:", err);
      toast.error("AI breakdown failed. Quota may be exceeded.");
      return null;
    }
  }, [userId]);

  // Recovery agent (CACHED for 30 min)
  const generateRecovery = useCallback(async (failingTask, allTasks) => {
    if (!userId) return null;
    
    try {
      const result = await withCache(
        userId,
        "recovery",
        { 
          taskId: failingTask.id,
          allTasksCount: allTasks.length,
        },
        () => runRecoveryAgent(failingTask, allTasks)
      );
      return result;
    } catch (err) {
      console.error("Recovery failed:", err);
      return null;
    }
  }, [userId]);

  // Conflict agent (CACHED for 30 min)
  const detectConflicts = useCallback(async (tasks) => {
    if (!userId) return null;
    
    try {
      const taskFingerprint = tasks
        .filter(t => !t.completed)
        .map(t => ({ id: t.id, title: t.title, deadline: t.deadline }));
      
      const result = await withCache(
        userId,
        "conflict",
        { tasks: taskFingerprint },
        () => runConflictAgent(tasks)
      );
      return result;
    } catch (err) {
      console.error("Conflict detection failed:", err);
      return null;
    }
  }, [userId]);

  // Email drafter (CACHED for 24 hours)
  const draftEmail = useCallback(async (task, emailType, userContext) => {
    if (!userId) return null;
    
    try {
      const result = await withCache(
        userId,
        "email",
        { 
          taskId: task.id,
          emailType,
          taskTitle: task.title,
        },
        () => runEmailDrafterAgent(task, emailType, userContext)
      );
      return result;
    } catch (err) {
      console.error("Email drafter failed:", err);
      return null;
    }
  }, [userId]);

  return {
    orchestratorData,
    riskData,
    crisisData,
    scheduleData,
    focusData,
    loading,
    lastRun,
    runAllAgents,
    breakdownTask,
    generateRecovery,
    detectConflicts,
    draftEmail,
  };
};