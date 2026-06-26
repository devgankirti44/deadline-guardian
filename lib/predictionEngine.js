// ═══════════════════════════════════════════════════
// TWO-SLOT PREDICTION ENGINE
// Predicts task completion probability based on:
// 1. Big Five personality profile
// 2. Task characteristics
// 3. Time-based patterns
// 4. Historical behavior
// ═══════════════════════════════════════════════════

const getProfile = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user_profile");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// ─── CALCULATE COMPLETION PROBABILITY ──────────────
export const predictCompletion = (task, allTasks = []) => {
  const profile = getProfile();
  
  // Default scoring if no profile
  let baseScore = 50;
  
  // ─── PRIORITY IMPACT (high priority = more likely) ───
  const priorityBoost = {
    critical: 30,
    high: 20,
    medium: 5,
    low: -10,
  };
  baseScore += priorityBoost[task.priority] || 0;
  
  // ─── CATEGORY IMPACT ───
  const highReliabilityCategories = ["Finance", "Work", "Project", "Assignment"];
  const lowReliabilityCategories = ["Health", "Personal", "Learning"];
  
  if (highReliabilityCategories.includes(task.category)) {
    baseScore += 15;
  } else if (lowReliabilityCategories.includes(task.category)) {
    baseScore -= 10;
  }
  
  // ─── DEADLINE PRESSURE ───
  if (task.deadline) {
    const hoursLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
    
    if (hoursLeft < 6) baseScore += 25;  // Imminent
    else if (hoursLeft < 24) baseScore += 15;  // Today
    else if (hoursLeft < 72) baseScore += 5;   // This week
    else if (hoursLeft > 168) baseScore -= 15; // Far future = procrastinate
  } else {
    baseScore -= 20; // No deadline = often skipped
  }
  
  // ─── ESTIMATED DURATION IMPACT ───
  const estimatedHours = task.estimatedHours || 1;
  if (estimatedHours <= 0.5) baseScore += 10;  // Quick wins
  else if (estimatedHours <= 2) baseScore += 5;
  else if (estimatedHours > 4) baseScore -= 15; // Long tasks = procrastinate
  
  // ─── BIG FIVE PROFILE ADJUSTMENTS ───
  if (profile) {
    const { scores, procrastinationRisk, stressResponse, productivityStyle } = profile;
    
    // CONSCIENTIOUSNESS: Higher = better completion
    if (scores.conscientiousness >= 75) baseScore += 20;
    else if (scores.conscientiousness >= 50) baseScore += 10;
    else if (scores.conscientiousness < 30) baseScore -= 20;
    
    // NEUROTICISM: Higher = struggle with critical tasks
    if (scores.neuroticism >= 70 && task.priority === "critical") {
      baseScore -= 10; // Anxiety reduces completion
    }
    
    // OPENNESS: Higher = adapts to new strategies
    if (scores.openness >= 70 && task.category === "Learning") {
      baseScore += 10;
    }
    
    // Procrastination risk modifier
    if (procrastinationRisk === "high") baseScore -= 15;
    else if (procrastinationRisk === "low") baseScore += 10;
    
    // High-stress profile struggles with multiple critical tasks
    const criticalCount = allTasks.filter(t => 
      !t.completed && t.riskLevel === "critical"
    ).length;
    
    if (stressResponse === "high_anxiety" && criticalCount > 2) {
      baseScore -= 20; // Overwhelmed
    }
  }
  
  // ─── WORKLOAD CONTEXT ───
  const totalActiveHours = allTasks
    .filter(t => !t.completed)
    .reduce((sum, t) => sum + (t.estimatedHours || 1), 0);
  
  if (totalActiveHours > 20) baseScore -= 15; // Too much work
  
  // Clamp 5-95
  baseScore = Math.max(5, Math.min(95, baseScore));
  
  return Math.round(baseScore);
};

// ─── GENERATE PREDICTION REASON ──────────────────────
export const generatePredictionReason = (task, probability, profile) => {
  const reasons = [];
  
  // High probability reasons
  if (probability >= 70) {
    if (task.priority === "critical") reasons.push("critical priority drives urgency");
    if (task.deadline) {
      const hoursLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
      if (hoursLeft < 24) reasons.push("imminent deadline");
    }
    if (task.category === "Finance") reasons.push("financial stakes ensure completion");
    if (profile?.scores?.conscientiousness >= 70) reasons.push("your high discipline score");
    if ((task.estimatedHours || 1) <= 1) reasons.push("quick win mentality");
  }
  
  // Low probability reasons
  if (probability < 50) {
    if (!task.deadline) reasons.push("no external deadline pressure");
    if ((task.estimatedHours || 1) > 3) reasons.push("long task triggers procrastination");
    if (task.category === "Health" || task.category === "Personal") {
      reasons.push("personal tasks often deferred");
    }
    if (profile?.procrastinationRisk === "high") reasons.push("your procrastination pattern");
    if (profile?.scores?.neuroticism >= 70) reasons.push("stress avoidance behavior");
  }
  
  // Medium reasons
  if (probability >= 50 && probability < 70) {
    reasons.push("moderate engagement expected");
    if (profile?.scores?.conscientiousness >= 50) reasons.push("balanced personality");
  }
  
  return reasons.slice(0, 2).join(" + ") || "based on overall context";
};

// ─── CATEGORIZE TASKS INTO SLOTS ─────────────────────
export const categorizeIntoSlots = (tasks) => {
  const profile = getProfile();
  const activeTasks = tasks.filter(t => !t.completed);
  
  const analyzed = activeTasks.map(task => {
    const probability = predictCompletion(task, tasks);
    const reason = generatePredictionReason(task, probability, profile);
    
    return {
      ...task,
      completionProbability: probability,
      predictionReason: reason,
      slot: probability >= 65 ? "likely_complete" 
          : probability >= 35 ? "uncertain"
          : "likely_skip",
    };
  });
  
  return {
    likely_complete: analyzed
      .filter(t => t.slot === "likely_complete")
      .sort((a, b) => b.completionProbability - a.completionProbability),
    uncertain: analyzed
      .filter(t => t.slot === "uncertain")
      .sort((a, b) => b.completionProbability - a.completionProbability),
    likely_skip: analyzed
      .filter(t => t.slot === "likely_skip")
      .sort((a, b) => a.completionProbability - b.completionProbability),
  };
};

// ─── GENERATE RECOVERY ACTIONS FOR SKIPPED TASKS ───
export const generateSkipActions = (task) => {
  const actions = [];
  
  // Always available actions
  actions.push({
    label: "Reschedule deadline",
    icon: "📅",
    description: "Push deadline to a more realistic time",
    action: "reschedule",
  });
  
  // Based on category
  if (task.category === "Health" || task.category === "Personal") {
    actions.push({
      label: "Break into 5-min steps",
      icon: "✂️",
      description: "Reduce friction with micro-tasks",
      action: "break_down",
    });
  }
  
  if (task.category === "Work" || task.category === "Project") {
    actions.push({
      label: "Delegate or share",
      icon: "👥",
      description: "Pass to a teammate",
      action: "delegate",
    });
  }
  
  if (task.category === "Learning") {
    actions.push({
      label: "Convert to passive learning",
      icon: "🎧",
      description: "Podcast version while commuting",
      action: "passive_mode",
    });
  }
  
  // Always available
  actions.push({
    label: "Drop this mission",
    icon: "🗑️",
    description: "Remove if no longer essential",
    action: "drop",
  });
  
  actions.push({
    label: "Force commitment",
    icon: "⚡",
    description: "Tell someone you'll do it (accountability)",
    action: "accountability",
  });
  
  return actions;
};

// ─── OVERALL WORKLOAD ASSESSMENT ─────────────────────
export const assessWorkload = (slots) => {
  const totalActive = slots.likely_complete.length + slots.uncertain.length + slots.likely_skip.length;
  const completionRate = totalActive > 0 
    ? Math.round((slots.likely_complete.length / totalActive) * 100) 
    : 100;
  
  let healthStatus = "OPTIMAL";
  let healthColor = "#10B981";
  let healthMessage = "Your workload aligns with your behavior patterns.";
  
  if (slots.likely_skip.length >= 3) {
    healthStatus = "OVERCOMMITTED";
    healthColor = "#EF4444";
    healthMessage = `${slots.likely_skip.length} missions are unlikely to complete. Consider dropping or delegating.`;
  } else if (slots.likely_skip.length >= 1) {
    healthStatus = "AT RISK";
    healthColor = "#F59E0B";
    healthMessage = `${slots.likely_skip.length} mission${slots.likely_skip.length > 1 ? "s" : ""} need attention to prevent failure.`;
  } else if (slots.uncertain.length >= 3) {
    healthStatus = "REQUIRES FOCUS";
    healthColor = "#FCD34D";
    healthMessage = "Several missions in uncertain zone. Pick your battles.";
  }
  
  return {
    totalActive,
    completionRate,
    healthStatus,
    healthColor,
    healthMessage,
  };
};