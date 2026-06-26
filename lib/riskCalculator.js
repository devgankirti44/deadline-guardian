import { RISK_THRESHOLDS, URGENCY_HOURS } from "@/constants/agentPrompts";

// Calculate risk without API
export const calculateRisk = (task) => {
  if (!task.deadline) {
    return {
      score: task.priority === "critical" ? 40 : 10,
      level: task.priority === "critical" ? "medium" : "low",
      hoursRemaining: null,
      label: "NO DEADLINE",
    };
  }

  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
  const estimatedHours = task.estimatedHours || 2;

  // Already missed
  if (hoursRemaining < 0) {
    return {
      score: 100,
      level: "critical",
      hoursRemaining: 0,
      label: "OVERDUE",
    };
  }

  // Not enough time left
  if (hoursRemaining < estimatedHours) {
    return {
      score: 92,
      level: "critical",
      hoursRemaining,
      label: "BREACH IMMINENT",
    };
  }

  // Calculate base score from time ratio
  const timeRatio = estimatedHours / hoursRemaining;
  let baseScore = Math.min(90, timeRatio * 70);

  // Urgency multipliers
  if (hoursRemaining < URGENCY_HOURS.CRITICAL) baseScore = Math.max(baseScore, 65);
  else if (hoursRemaining < URGENCY_HOURS.HIGH) baseScore = Math.max(baseScore, 40);
  else if (hoursRemaining < URGENCY_HOURS.MEDIUM) baseScore = Math.max(baseScore, 20);

  // Priority modifiers
  const priorityBoost = {
    critical: 15,
    high: 8,
    medium: 0,
    low: -10,
  };
  baseScore += priorityBoost[task.priority] || 0;
  baseScore = Math.min(99, Math.max(0, Math.round(baseScore)));

  // Determine level
  let level = "low";
  let label = "ON TRACK";
  if (baseScore >= RISK_THRESHOLDS.CRITICAL) {
    level = "critical";
    label = "CRITICAL";
  } else if (baseScore >= RISK_THRESHOLDS.HIGH) {
    level = "high";
    label = "HIGH RISK";
  } else if (baseScore >= RISK_THRESHOLDS.MEDIUM) {
    level = "medium";
    label = "MONITOR";
  } else {
    level = "low";
    label = "NOMINAL";
  }

  return { score: baseScore, level, hoursRemaining, label };
};

export const formatTimeRemaining = (hours) => {
  if (hours === null) return "NO DEADLINE";
  if (hours <= 0) return "OVERDUE";
  if (hours < 1) return `${Math.round(hours * 60)}m remaining`;
  if (hours < 24) return `${Math.round(hours)}h remaining`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h remaining`;
};

export const getStatusColor = (level) => {
  const colors = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#FCD34D",
    low: "#10B981",
  };
  return colors[level] || "#6B7280";
};

export const sortTasksByRisk = (tasks) => {
  return [...tasks].sort((a, b) => {
    const riskA = calculateRisk(a);
    const riskB = calculateRisk(b);
    return riskB.score - riskA.score;
  });
};