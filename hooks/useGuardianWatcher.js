"use client";
import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";

const CHECK_INTERVAL = 30000; // 30 seconds

export const useGuardianWatcher = (tasks) => {
  const { sendNotification, isEnabled } = useNotifications();
  const notifiedTasksRef = useRef(new Set());
  const lastCheckRef = useRef(Date.now());

  useEffect(() => {
    if (!isEnabled || !tasks || tasks.length === 0) return;

    const checkDeadlines = () => {
      const now = Date.now();
      const activeTasks = tasks.filter(t => !t.completed);

      activeTasks.forEach(task => {
        if (!task.deadline || !task.id) return;

        const deadline = new Date(task.deadline).getTime();
        const hoursLeft = (deadline - now) / (1000 * 60 * 60);

        // ALERT 1: CRITICAL (< 1 hour)
        if (hoursLeft > 0 && hoursLeft <= 1) {
          const key = `critical-${task.id}`;
          if (!notifiedTasksRef.current.has(key)) {
            sendNotification(`🚨 CRITICAL: ${task.title}`, {
              body: `Less than 1 hour remaining! Start NOW or accept failure.`,
              tag: key,
              requireInteraction: true,
              vibrate: [200, 100, 200],
            });
            notifiedTasksRef.current.add(key);
          }
        }

        // ALERT 2: HIGH RISK (< 3 hours)
        else if (hoursLeft > 1 && hoursLeft <= 3) {
          const key = `high-${task.id}`;
          if (!notifiedTasksRef.current.has(key)) {
            sendNotification(`⚠ HIGH RISK: ${task.title}`, {
              body: `${Math.round(hoursLeft)}h remaining. Recommended: enter focus mode now.`,
              tag: key,
              vibrate: [100, 50, 100],
            });
            notifiedTasksRef.current.add(key);
          }
        }

        // ALERT 3: APPROACHING (< 12 hours)
        else if (hoursLeft > 3 && hoursLeft <= 12) {
          const key = `approaching-${task.id}-12h`;
          if (!notifiedTasksRef.current.has(key)) {
            sendNotification(`⏰ Deadline approaching: ${task.title}`, {
              body: `${Math.round(hoursLeft)} hours until deadline.`,
              tag: key,
            });
            notifiedTasksRef.current.add(key);
          }
        }

        // ALERT 4: OVERDUE
        else if (hoursLeft < 0) {
          const key = `overdue-${task.id}`;
          if (!notifiedTasksRef.current.has(key)) {
            sendNotification(`❌ MISSION FAILED: ${task.title}`, {
              body: `Deadline missed by ${Math.abs(Math.round(hoursLeft))}h. Damage control needed.`,
              tag: key,
              requireInteraction: true,
            });
            notifiedTasksRef.current.add(key);
          }
        }
      });

      // COGNITIVE OVERLOAD
      const criticalCount = activeTasks.filter(t => t.riskLevel === "critical").length;
      if (criticalCount >= 3) {
        const key = `overload-${new Date().toDateString()}`;
        if (!notifiedTasksRef.current.has(key)) {
          sendNotification("🧠 COGNITIVE OVERLOAD DETECTED", {
            body: `${criticalCount} critical missions simultaneously. Recommend single-task focus protocol.`,
            tag: key,
            requireInteraction: true,
          });
          notifiedTasksRef.current.add(key);
        }
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [tasks, isEnabled, sendNotification]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      notifiedTasksRef.current = new Set();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);
};