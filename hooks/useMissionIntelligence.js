"use client";
import { useState, useCallback } from "react";
import {
  detectTaskType,
  estimateEffort,
  analyzeFeasibility,
  simulateDeadlines,
} from "@/lib/missionIntelligence";
import { withCache } from "@/lib/aiCacheManager";
import toast from "react-hot-toast";

export const useMissionIntelligence = (userId) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [effortEstimate, setEffortEstimate] = useState(null);
  const [feasibility, setFeasibility] = useState(null);
  const [deadlineSimulation, setDeadlineSimulation] = useState(null);
  const [taskType, setTaskType] = useState(null);

  // Step 1: Analyze task type & get questions
  const analyzeTaskType = useCallback(async (title, description = "") => {
    if (!title) return;
    setAnalyzing(true);
    toast.loading("AI analyzing your mission...", { id: "mission-analysis" });

    try {
      const result = await withCache(
        userId,
        "task-type",
        { title, description },
        () => detectTaskType(title, description)
      );

      if (result) {
        setTaskType(result.taskType);
        setQuestions(result.suggestedQuestions || []);
        toast.success("Mission analyzed", { id: "mission-analysis" });
      }
      return result;
    } catch (error) {
      console.error("Task analysis failed:", error);
      toast.error("Analysis failed", { id: "mission-analysis" });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [userId]);

  // Step 2: Estimate effort based on answers
  const estimateMissionEffort = useCallback(async (taskData) => {
    setAnalyzing(true);
    toast.loading("Calculating effort...", { id: "effort-estimation" });

    try {
      const result = await withCache(
        userId,
        "effort",
        { taskData },
        () => estimateEffort(taskData)
      );

      if (result) {
        setEffortEstimate(result);
        toast.success("Effort estimated", { id: "effort-estimation" });
      }
      return result;
    } catch (error) {
      console.error("Effort estimation failed:", error);
      toast.error("Estimation failed", { id: "effort-estimation" });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [userId]);

  // Step 3: Check feasibility
  const checkFeasibility = useCallback(async (taskData, availableHoursPerDay, daysAvailable, existingTasksHours = 0) => {
    setAnalyzing(true);
    toast.loading("Checking feasibility...", { id: "feasibility" });

    try {
      const result = await analyzeFeasibility(
        taskData,
        availableHoursPerDay,
        daysAvailable,
        existingTasksHours
      );

      if (result) {
        setFeasibility(result);
        toast.success("Feasibility analyzed", { id: "feasibility" });
      }
      return result;
    } catch (error) {
      console.error("Feasibility check failed:", error);
      toast.error("Check failed", { id: "feasibility" });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Step 4: Simulate different deadlines
  const simulateScenarios = useCallback(async (taskData, totalHours, availableHoursPerDay) => {
    setAnalyzing(true);
    toast.loading("Simulating scenarios...", { id: "simulation" });

    try {
      const result = await simulateDeadlines(taskData, totalHours, availableHoursPerDay);

      if (result) {
        setDeadlineSimulation(result);
        toast.success("Simulations complete", { id: "simulation" });
      }
      return result;
    } catch (error) {
      console.error("Simulation failed:", error);
      toast.error("Simulation failed", { id: "simulation" });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuestions([]);
    setEffortEstimate(null);
    setFeasibility(null);
    setDeadlineSimulation(null);
    setTaskType(null);
  }, []);

  return {
    analyzing,
    taskType,
    questions,
    effortEstimate,
    feasibility,
    deadlineSimulation,
    analyzeTaskType,
    estimateMissionEffort,
    checkFeasibility,
    simulateScenarios,
    reset,
  };
};