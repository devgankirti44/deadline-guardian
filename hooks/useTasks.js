"use client";
import { useState, useEffect, useCallback } from "react";
import {
  subscribeToUserTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/firebase";
import { calculateRisk } from "@/lib/riskCalculator";
import toast from "react-hot-toast";

export const useTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeToUserTasks(userId, (rawTasks) => {
      // Enrich tasks with local risk scores
      const enriched = rawTasks.map((task) => {
        const risk = calculateRisk(task);
        return { ...task, riskScore: risk.score, riskLevel: risk.level, riskLabel: risk.label };
      });
      setTasks(enriched);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const addTask = useCallback(
    async (taskData) => {
      if (!userId) return;
      const { id, error } = await createTask(userId, taskData);
      if (error) {
        toast.error("Failed to create task");
      } else {
        toast.success("Mission created");
      }
      return { id, error };
    },
    [userId]
  );

  const editTask = useCallback(async (taskId, updates) => {
    const { error } = await updateTask(taskId, updates);
    if (error) toast.error("Update failed");
    return { error };
  }, []);

  const removeTask = useCallback(async (taskId) => {
    const { error } = await deleteTask(taskId);
    if (error) toast.error("Delete failed");
    else toast.success("Mission removed");
    return { error };
  }, []);

  const completeTask = useCallback(
    async (taskId) => {
      const { error } = await updateTask(taskId, {
        completed: true,
        completedAt: new Date().toISOString(),
      });
      if (!error) toast.success("Mission complete! ✓");
      return { error };
    },
    []
  );

  // Computed values
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const criticalTasks = activeTasks.filter((t) => t.riskLevel === "critical");
  const completedToday = completedTasks.filter((t) => {
    if (!t.completedAt) return false;
    const today = new Date();
    const comp = new Date(t.completedAt);
    return comp.toDateString() === today.toDateString();
  });

  return {
    tasks,
    activeTasks,
    completedTasks,
    criticalTasks,
    completedToday,
    loading,
    addTask,
    editTask,
    removeTask,
    completeTask,
  };
};