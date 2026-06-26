"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { useNotifications } from "./useNotifications";

// ═══════════════════════════════════════════════
// 🔔 REMINDER ENGINE v3 (Bug-Fixed)
// - Only fires when tab is visible
// - 30-second delay on mount (prevents spam)
// - Cooldowns persist across HMR reloads
// ═══════════════════════════════════════════════

const STORAGE_KEY = "reminder_engine_v3";
const STARTUP_DELAY = 30 * 1000; // 30 seconds before any notification can fire

const INTERVALS = {
  DEADLINE_CHECK: 5 * 60 * 1000,    // Check every 5 minutes
  IDLE_CHECK: 15 * 60 * 1000,       // Check idle every 15 minutes
  DAILY_CHECK: 10 * 60 * 1000,      // Check daily triggers every 10 minutes
};

const COOLDOWNS = {
  CRITICAL: 60 * 60 * 1000,         // 1 hour
  HIGH: 3 * 60 * 60 * 1000,         // 3 hours
  MEDIUM: 6 * 60 * 60 * 1000,       // 6 hours
  IDLE: 2 * 60 * 60 * 1000,         // 2 hours
  DAILY: 12 * 60 * 60 * 1000,       // 12 hours
};

const loadState = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveState = (state) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export const useReminderEngine = (tasks = [], crisisData = null, profile = null) => {
  const { sendNotification, isEnabled, requestPermission, permission } = useNotifications();
  const [engineState, setEngineState] = useState("loading");

  const lastSentRef = useRef(loadState());
  const lastActivityRef = useRef(Date.now());
  const mountTimeRef = useRef(Date.now());
  const intervalsRef = useRef([]);
  const isTabVisibleRef = useRef(true);

  // ─── Status display ───
  useEffect(() => {
    if (permission === "granted") setEngineState("active");
    else if (permission === "denied") setEngineState("disabled");
    else setEngineState("loading");
  }, [permission]);

  // ─── Track tab visibility (DON'T fire if tab hidden) ───
  useEffect(() => {
    const updateVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
    };
    
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  // ─── Track activity ───
  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ["mousemove", "keydown", "click"];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
  }, []);

  // ─── Cooldown check ───
  const canSend = useCallback((key, cooldownMs) => {
    const last = lastSentRef.current[key] || 0;
    const now = Date.now();
    if (now - last < cooldownMs) return false;
    lastSentRef.current[key] = now;
    saveState(lastSentRef.current);
    return true;
  }, []);

  // ─── Safe send (checks all conditions) ───
  const safeSend = useCallback((title, options) => {
    // 1. Notification permission?
    if (!isEnabled) {
      console.log("📵 Notification skipped: permission not granted");
      return;
    }
    
    // 2. Has 30 seconds passed since mount? (prevents HMR spam)
    const timeSinceMount = Date.now() - mountTimeRef.current;
    if (timeSinceMount < STARTUP_DELAY) {
      console.log(`📵 Notification skipped: startup delay (${Math.round((STARTUP_DELAY - timeSinceMount) / 1000)}s remaining)`);
      return;
    }

    // 3. Is the tab open AND visible?
    if (!isTabVisibleRef.current && !options.requireInteraction) {
      console.log("📵 Notification skipped: tab hidden");
      // Still send if critical (requireInteraction = true)
      if (!options.requireInteraction) return;
    }

    sendNotification(title, options);
  }, [isEnabled, sendNotification]);

  // ─── 1. DEADLINE CHECKS ───
  const checkDeadlines = useCallback(() => {
    if (!isEnabled || !tasks?.length) return;

    const activeTasks = tasks.filter(t => !t.completed && t.deadline);
    const now = Date.now();

    activeTasks.forEach(task => {
      const deadline = new Date(task.deadline).getTime();
      const hoursLeft = (deadline - now) / 3600000;

      // 🔴 Only fire when DEADLINE IS APPROACHING (not all at once)
      
      // Less than 1 hour
      if (hoursLeft > 0 && hoursLeft < 1) {
        const key = `1h_${task.id}`;
        if (canSend(key, COOLDOWNS.CRITICAL)) {
          safeSend("⚠️ DEADLINE IN UNDER 1 HOUR", {
            body: `"${task.title}" — ${Math.round(hoursLeft * 60)} min left!`,
            tag: key,
            requireInteraction: true,
          });
        }
      }
      // 2 hours
      else if (hoursLeft >= 1 && hoursLeft < 2) {
        const key = `2h_${task.id}`;
        if (canSend(key, COOLDOWNS.HIGH)) {
          safeSend("⏰ 2 hours until deadline", {
            body: `"${task.title}" — time to focus`,
            tag: key,
          });
        }
      }
      // 6 hours warning
      else if (hoursLeft >= 5 && hoursLeft < 6) {
        const key = `6h_${task.id}`;
        if (canSend(key, COOLDOWNS.MEDIUM)) {
          safeSend("📋 6 hours until deadline", {
            body: `"${task.title}" — plan your time`,
            tag: key,
          });
        }
      }
    });
  }, [tasks, isEnabled, safeSend, canSend]);

  // ─── 2. CRISIS CHECKS ───
  const checkCrises = useCallback(() => {
    if (!isEnabled || !crisisData?.crises?.length) return;

    crisisData.crises.forEach(crisis => {
      if (crisis.severity !== "CRITICAL") return;
      
      const key = `crisis_${crisis.taskId}`;
      if (canSend(key, COOLDOWNS.CRITICAL)) {
        safeSend(`🚨 ${crisis.headline || "CRITICAL"}`, {
          body: crisis.immediateActions?.[0] || "Take action",
          tag: key,
          requireInteraction: true,
        });
      }
    });
  }, [crisisData, isEnabled, safeSend, canSend]);

  // ─── 3. IDLE CHECK ───
  const checkIdle = useCallback(() => {
    if (!isEnabled || !isTabVisibleRef.current) return;

    const idleMin = (Date.now() - lastActivityRef.current) / 60000;
    if (idleMin < 45) return;

    const critical = tasks.filter(
      t => !t.completed && (t.riskLevel === "critical" || t.riskLevel === "high")
    );
    
    if (critical.length > 0 && canSend("idle", COOLDOWNS.IDLE)) {
      safeSend("💤 You've been away", {
        body: `${critical.length} urgent task${critical.length > 1 ? "s" : ""} waiting`,
        tag: "idle",
      });
    }
  }, [tasks, isEnabled, safeSend, canSend]);

  // ─── 4. DAILY TRIGGERS ───
  const checkDaily = useCallback(() => {
    if (!isEnabled) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 8:00-8:10 AM only
    if (hour === 8 && minute < 10) {
      const key = `morning_${now.toDateString()}`;
      if (canSend(key, COOLDOWNS.DAILY)) {
        const active = tasks.filter(t => !t.completed);
        const crit = active.filter(t => t.riskLevel === "critical").length;
        safeSend("🌅 Morning briefing", {
          body: `${active.length} active${crit > 0 ? ` • ${crit} CRITICAL` : ""}`,
          tag: key,
        });
      }
    }

    // 8:00-8:10 PM only
    if (hour === 20 && minute < 10) {
      const key = `evening_${now.toDateString()}`;
      if (canSend(key, COOLDOWNS.DAILY)) {
        const done = tasks.filter(t => {
          if (!t.completed || !t.updatedAt) return false;
          return new Date(t.updatedAt).toDateString() === now.toDateString();
        }).length;
        safeSend("🌙 Evening review", {
          body: `${done} completed today. ${done >= 3 ? "Excellent! 🔥" : "Keep going!"}`,
          tag: key,
        });
      }
    }
  }, [tasks, isEnabled, safeSend, canSend]);

  // ─── MAIN LOOP ───
  useEffect(() => {
    if (!isEnabled) return;

    console.log(`🔔 Reminder engine ACTIVE (${STARTUP_DELAY / 1000}s startup delay)`);
    
    // Reset mount time
    mountTimeRef.current = Date.now();
    
    // Clear old intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    // Set up intervals (NO immediate execution - waits for first tick)
    intervalsRef.current = [
      setInterval(checkDeadlines, INTERVALS.DEADLINE_CHECK),
      setInterval(checkCrises, INTERVALS.DEADLINE_CHECK),
      setInterval(checkIdle, INTERVALS.IDLE_CHECK),
      setInterval(checkDaily, INTERVALS.DAILY_CHECK),
    ];

    return () => {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
    };
  }, [isEnabled, checkDeadlines, checkCrises, checkIdle, checkDaily]);

  return {
    isActive: engineState === "active",
    engineState,
    requestPermission,
  };
};