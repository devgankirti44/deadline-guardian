import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS, RISK_THRESHOLDS } from "@/constants/agentPrompts";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

// ─── 🛡️ Model fallback chain ──────────────────────────
const MODEL_CHAIN = [
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash-001",
  "gemini-flash-latest",
];

// ─── Helper: get model with system prompt ─────────────
const getAgent = (systemPrompt, temperature = 0.3, modelName = MODEL_CHAIN[0]) => {
  const prompt = systemPrompt.replace(
    "TIMESTAMP_PLACEHOLDER",
    new Date().toISOString()
  );
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: prompt,
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });
};

// ─── 🔄 Try multiple models until one works ───────────
const generateWithFallback = async (systemPrompt, prompt, temperature = 0.3) => {
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);
      const agent = getAgent(systemPrompt, temperature, modelName);
      const result = await agent.generateContent(prompt);
      console.log(`✅ Success with ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err.message || "";

      if (msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("overload")) {
        console.log(`⚠️ ${modelName} failed (${msg.substring(0, 50)}...), trying next model`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
};

// ─── Helper: safe JSON parse ──────────────────────────
const safeJSON = (text, fallback = {}) => {
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
};

// ══════════════════════════════════════════════════════
// AGENT 1: RISK PREDICTION
// ══════════════════════════════════════════════════════
export const runRiskAgent = async (tasks) => {
  if (!tasks || tasks.length === 0) return { risks: [] };

  const taskData = tasks
    .filter((t) => !t.completed)
    .map((t) => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
      estimatedHours: t.estimatedHours || 2,
      priority: t.priority || "medium",
    }));

  const prompt = `
Analyze deadline risk for these tasks. Be precise and direct.
${JSON.stringify(taskData, null, 2)}

Return JSON:
{
  "risks": [
    {
      "taskId": "id",
      "riskScore": 85,
      "riskLevel": "critical|high|medium|low",
      "probability": "85% chance of missing deadline",
      "primaryReason": "Only 4 hours left with 8 hours of work",
      "hoursRemaining": 4,
      "recommendation": "Immediate action required"
    }
  ],
  "overallSystemStatus": "critical|warning|stable",
  "criticalCount": 2,
  "totalThreats": 3
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.RISK_AGENT, prompt, 0.2);
    return safeJSON(result.response.text(), { risks: [] });
  } catch (error) {
    console.error("Risk Agent failed (all models):", error);
    return { risks: [] };
  }
};

// ══════════════════════════════════════════════════════
// AGENT 2: CRISIS DETECTION
// ══════════════════════════════════════════════════════
export const runCrisisAgent = async (tasks, riskData) => {
  if (!tasks || tasks.length === 0) return { crises: [] };

  const prompt = `
Tasks: ${JSON.stringify(tasks.filter((t) => !t.completed).slice(0, 8))}
Risk Analysis: ${JSON.stringify(riskData)}

Generate crisis alerts for tasks with riskScore > 60.

Return JSON:
{
  "crises": [
    {
      "taskId": "id",
      "taskTitle": "Task name",
      "severity": "CRITICAL|HIGH|WARNING",
      "headline": "DEADLINE BREACH IMMINENT: [Task]",
      "timeRemaining": "4 hours 23 minutes",
      "protocol": "EMERGENCY_ESCALATION",
      "immediateActions": ["action 1", "action 2", "action 3"],
      "impactStatement": "Missing this deadline will impact...",
      "escalationRequired": true
    }
  ],
  "systemAlert": "3 MISSIONS AT RISK — IMMEDIATE INTERVENTION REQUIRED",
  "hasCritical": true
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.CRISIS_AGENT, prompt, 0.2);
    return safeJSON(result.response.text(), { crises: [] });
  } catch (error) {
    console.error("Crisis Agent failed (all models):", error);
    return { crises: [] };
  }
};

// ══════════════════════════════════════════════════════
// AGENT 7: RECOVERY PLAN (with model fallback)
// ══════════════════════════════════════════════════════
export const runRecoveryAgent = async (failingTask, allTasks) => {
  const otherTasks = allTasks
    .filter(t => t.id !== failingTask.id && !t.completed)
    .slice(0, 8);

  const hoursLeft = failingTask.deadline
    ? Math.round((new Date(failingTask.deadline) - new Date()) / (1000 * 60 * 60))
    : 0;

  const isOverdue = hoursLeft < 0;
  const taskCategory = failingTask.category || "general";

  const systemPrompt = `
You are the Recovery Planning Agent of Deadline Guardian AI.
You generate PRACTICAL, ACTIONABLE recovery plans — not motivational fluff.
Every action must be concrete enough to do RIGHT NOW.
Current timestamp: ${new Date().toISOString()}
Output: Valid JSON only. No markdown.
  `;

  const prompt = `
FAILING MISSION ANALYSIS:

Task: "${failingTask.title}"
Description: ${failingTask.description || "No description provided"}
Category: ${taskCategory}
Estimated Hours: ${failingTask.estimatedHours || 2}
Status: ${isOverdue ? `OVERDUE by ${Math.abs(hoursLeft)}h` : `${hoursLeft}h until deadline`}
Risk Score: ${failingTask.riskScore || 0}%
Priority: ${failingTask.priority || "medium"}

Other Active Tasks (for context):
${JSON.stringify(otherTasks.map(t => ({
  title: t.title,
  hoursLeft: t.deadline ? Math.round((new Date(t.deadline) - new Date()) / 3600000) : null,
  priority: t.priority,
})))}

GENERATE A RECOVERY PLAN WITH:
1. Specific failure analysis (not generic)
2. 3 strategies with CONCRETE steps for THIS task type
3. Each step must be executable in <30 minutes
4. Reference the actual task name and topic in steps

CRITICAL RULES:
- For study/learning tasks: suggest specific resources, time-boxing, scope reduction
- For work tasks: suggest stakeholder communication, MVP scope
- For personal tasks: suggest delegation, simplification
- NEVER say "try harder" or "manage time better"
- ALWAYS reference the specific task topic in step descriptions

Return JSON ONLY:
{
  "failureAnalysis": {
    "probability": 87,
    "primaryReason": "Specific reason mentioning the task title and topic",
    "secondaryReasons": ["concrete reason 2", "concrete reason 3"],
    "currentSuccessRate": 13,
    "timeShortage": "4 hours short"
  },
  "recoveryStrategies": [
    {
      "name": "FULL COMMITMENT",
      "type": "aggressive",
      "successRate": 85,
      "description": "Drop everything and focus 100% on ${failingTask.title} for next ${failingTask.estimatedHours || 2}h",
      "steps": [
        "Step that mentions the actual task topic and what to do in next 10 min",
        "Step 2 with specific action for THIS task",
        "Step 3 with measurable checkpoint",
        "Step 4 with completion criteria"
      ],
      "sacrifices": ["Specific task to defer with name", "Specific commitment to skip"],
      "estimatedTimeNeeded": "${failingTask.estimatedHours || 2} hours focused",
      "riskOfPlan": "What you lose by choosing this"
    },
    {
      "name": "REDUCED SCOPE",
      "type": "balanced",
      "successRate": 65,
      "description": "Deliver minimum viable version of ${failingTask.title}",
      "steps": [
        "Identify the 20% of ${failingTask.title} that delivers 80% of value",
        "Specific MVP definition for THIS task",
        "Execute MVP in reduced timeframe",
        "Document what was skipped for future"
      ],
      "sacrifices": ["Full scope of the task"],
      "estimatedTimeNeeded": "${Math.max(1, Math.floor((failingTask.estimatedHours || 2) / 2))} hours",
      "riskOfPlan": "Partial completion only"
    },
    {
      "name": "STRATEGIC RETREAT",
      "type": "safe",
      "successRate": 40,
      "description": "Accept partial failure on ${failingTask.title} to protect other commitments",
      "steps": [
        "Specific stakeholder/person to notify if applicable",
        "What partial output to deliver",
        "Concrete next-day recovery plan for ${failingTask.title}",
        "Lesson to capture"
      ],
      "sacrifices": ["This deadline"],
      "estimatedTimeNeeded": "1 hour damage control",
      "riskOfPlan": "Reputation impact"
    }
  ],
  "recommendedStrategy": "REDUCED SCOPE",
  "recommendationReason": "Why this strategy fits THIS specific task and situation",
  "immediateNextAction": "Concrete action mentioning the task topic — what to open, click, or do in the next 5 minutes",
  "warningIfIgnored": "Specific consequence of not acting now"
}`;

  try {
    const result = await generateWithFallback(systemPrompt, prompt, 0.4);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Recovery Agent failed (all models):", error);
    return null;
  }
};

// ══════════════════════════════════════════════════════
// AGENT 8: WORKLOAD CONFLICT DETECTOR
// ══════════════════════════════════════════════════════
export const runConflictAgent = async (tasks) => {
  const activeTasks = tasks.filter(t => !t.completed);

  const systemPrompt = `
You are the Workload Conflict Detection Agent.
Analyze task schedules to find conflicts, overloads, and impossible commitments.
Current timestamp: ${new Date().toISOString()}
Output: Always valid JSON only.
  `;

  const prompt = `
Analyze these missions for scheduling conflicts and workload issues:

${JSON.stringify(activeTasks.map(t => ({
  id: t.id,
  title: t.title,
  estimatedHours: t.estimatedHours || 2,
  hoursLeft: t.deadline ? Math.round((new Date(t.deadline) - new Date()) / 3600000) : null,
  priority: t.priority
})))}

Identify:
1. Days where workload exceeds 8 hours
2. Tasks competing for same time window
3. Impossible commitments (more work than time available)
4. Cognitive overload risks (too many high-priority items)

Return JSON ONLY:
{
  "totalWorkloadHours": 24,
  "availableHours": 16,
  "overloadHours": 8,
  "overloadStatus": "CRITICAL",
  "conflicts": [
    {
      "type": "TIME_OVERLAP",
      "severity": "HIGH",
      "taskIds": ["id1", "id2"],
      "taskTitles": ["Task A", "Task B"],
      "description": "Both require 4 hours in the next 6 hours",
      "resolution": "Defer Task B to tomorrow"
    }
  ],
  "criticalWarning": "You have 24 hours of work in 16 available hours.",
  "recommendations": [
    "Drop low-priority Task X",
    "Request extension on Task Y"
  ]
}`;

  try {
    const result = await generateWithFallback(systemPrompt, prompt, 0.3);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Conflict Agent failed (all models):", error);
    return null;
  }
};

// ══════════════════════════════════════════════════════
// AGENT 3: TASK BREAKDOWN
// ══════════════════════════════════════════════════════
export const runBreakdownAgent = async (task) => {
  const prompt = `
Break down this mission-critical task into actionable subtasks:
Title: ${task.title}
Description: ${task.description || "No description"}
Deadline: ${task.deadline ? new Date(task.deadline).toISOString() : "No deadline"}
Estimated Hours: ${task.estimatedHours || 2}
Priority: ${task.priority || "medium"}

Return JSON:
{
  "subtasks": [
    {
      "id": "st_1",
      "title": "Specific action title",
      "description": "Exactly what to do",
      "estimatedMinutes": 45,
      "order": 1,
      "checkpoint": "What done looks like"
    }
  ],
  "executionStrategy": "Start with X, then Y, then Z",
  "totalEstimatedHours": 3.5,
  "criticalPath": "The sequence that cannot be delayed",
  "successCriteria": "What success looks like"
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.BREAKDOWN_AGENT, prompt, 0.5);
    return safeJSON(result.response.text(), { subtasks: [] });
  } catch (error) {
    console.error("Breakdown Agent failed (all models):", error);
    return { subtasks: [] };
  }
};

// ══════════════════════════════════════════════════════
// AGENT 4: SCHEDULE
// ══════════════════════════════════════════════════════
export const runScheduleAgent = async (tasks, riskData) => {
  if (!tasks || tasks.length === 0) return { timeline: [] };

  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 8);

  const prompt = `
Generate execution timeline for today.
Tasks: ${JSON.stringify(activeTasks)}
Current time: ${new Date().toISOString()}
Available hours: now until 10 PM
Prioritize by: risk level first, then deadline proximity.

Return JSON:
{
  "timeline": [
    {
      "id": "block_1",
      "startTime": "09:00",
      "endTime": "10:30",
      "taskId": "task_id",
      "taskTitle": "Work on: Project Report",
      "type": "execution|review|break",
      "priority": "critical|high|medium|low",
      "objective": "Complete sections 1-3",
      "notes": "Disable notifications"
    }
  ],
  "todayFocus": "Most important task",
  "estimatedCompletion": "All critical tasks by 6 PM",
  "bufferTime": "1.5 hours reserved",
  "commandMessage": "Execute in sequence. No deviations."
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.SCHEDULE_AGENT, prompt, 0.4);
    return safeJSON(result.response.text(), { timeline: [] });
  } catch (error) {
    console.error("Schedule Agent failed (all models):", error);
    return { timeline: [] };
  }
};

// ══════════════════════════════════════════════════════
// AGENT 5: ORCHESTRATOR
// ══════════════════════════════════════════════════════
export const runOrchestrator = async (tasks, userContext = {}) => {
  const activeTasks = tasks.filter((t) => !t.completed);

  const prompt = `
MISSION BRIEFING:
Active tasks: ${activeTasks.length}
User: ${userContext.name || "Operator"}
Time: ${new Date().toISOString()}
Tasks: ${JSON.stringify(activeTasks.slice(0, 6))}

Generate command center intelligence briefing.

Return JSON:
{
  "systemStatus": "CRITICAL|WARNING|STABLE|OPTIMAL",
  "missionReadiness": 72,
  "activeMissions": 5,
  "threatsDetected": 2,
  "commandBriefing": "Specific briefing about current situation",
  "todayObjective": "Complete X and Y by 5 PM",
  "operatorAdvice": "You are 2 tasks behind. Focus now."
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.ORCHESTRATOR, prompt, 0.3);
    return safeJSON(result.response.text(), {});
  } catch (error) {
    console.error("Orchestrator failed (all models):", error);
    return {};
  }
};

// ══════════════════════════════════════════════════════
// AGENT 6: FOCUS PULSE
// ══════════════════════════════════════════════════════
export const runFocusAgent = async (tasks, completedToday = 0) => {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const prompt = `
Analyze focus and productivity state:
Time: ${timeOfDay} (${hour}:00)
Active tasks: ${tasks.filter((t) => !t.completed).length}
Completed today: ${completedToday}

Return JSON:
{
  "focusScore": 72,
  "energyLevel": "high|medium|low|depleted",
  "focusState": "deep_work|shallow|distracted|peak",
  "recommendation": "Specific advice for this moment",
  "currentWindowQuality": "excellent|good|fair|poor",
  "nextBreakIn": "45 minutes",
  "focusTips": ["tip 1", "tip 2", "tip 3"]
}`;

  try {
    const result = await generateWithFallback(SYSTEM_PROMPTS.FOCUS_AGENT, prompt, 0.6);
    return safeJSON(result.response.text(), {});
  } catch (error) {
    console.error("Focus Agent failed (all models):", error);
    return {};
  }
};

// ══════════════════════════════════════════════════════
// LOCAL RISK CALCULATOR
// ══════════════════════════════════════════════════════
export const calculateLocalRisk = (task) => {
  if (!task.deadline) return { score: 10, level: "low" };
  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);
  const estimatedHours = task.estimatedHours || 2;

  if (hoursLeft < 0) return { score: 100, level: "critical" };
  if (hoursLeft < estimatedHours) return { score: 90, level: "critical" };

  const ratio = estimatedHours / hoursLeft;
  let score = Math.min(95, Math.round(ratio * 80));
  if (hoursLeft < 24) score = Math.max(score, 65);
  if (hoursLeft < 48) score = Math.max(score, 40);

  const level = score >= 80 ? "critical" : score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  return { score, level, hoursLeft: Math.max(0, hoursLeft) };
};

// ══════════════════════════════════════════════════════
// AGENT 9: EMAIL DRAFTER
// ══════════════════════════════════════════════════════
export const runEmailDrafterAgent = async (task, emailType, userContext = {}) => {
  const hoursLeft = task.deadline
    ? Math.round((new Date(task.deadline) - new Date()) / 3600000)
    : 0;

  const status = hoursLeft < 0
    ? `OVERDUE by ${Math.abs(hoursLeft)} hours`
    : hoursLeft < 24
    ? `${hoursLeft} hours remaining`
    : `${Math.floor(hoursLeft / 24)} days remaining`;

  const emailTypeContext = {
    extension: "Request a deadline extension. Be respectful, give a brief honest reason, propose a new realistic deadline.",
    apology: "Apologize for missing/likely missing deadline. Take ownership, no excuses. Provide a clear plan to make it right.",
    update: "Send a status update. Show progress made, acknowledge challenges, give realistic completion estimate.",
    heads_up: "Casual heads-up message for a teammate/colleague. Friendly tone but professional. Brief and respectful.",
  };

  const systemPrompt = `
You are the Email Drafter Agent of Deadline Guardian AI.
Your job: Generate professional, ready-to-send emails for deadline-related situations.
Be authentic, accountable, and solution-focused.
Current timestamp: ${new Date().toISOString()}
Output: Always valid JSON only.
  `;

  const prompt = `
DRAFT A PROFESSIONAL EMAIL FOR THIS SITUATION:

Task: "${task.title}"
${task.description ? `Context: ${task.description}` : ""}
Status: ${status}
Priority: ${task.priority || "medium"}
Category: ${task.category || "Work"}
User Name: ${userContext.name || "[Your Name]"}

Email Type: ${emailType}
Tone Required: ${emailTypeContext[emailType] || emailTypeContext.update}

Generate 3 VARIATIONS of this email (formal, balanced, casual tones).

Return JSON ONLY:
{
  "emails": [
    {
      "tone": "Formal",
      "toneDescription": "Highly professional, corporate-friendly",
      "subject": "Subject line here",
      "body": "Full email body. Use \\n for line breaks.",
      "estimatedReadTime": "30 seconds",
      "useCase": "When emailing professors, senior management"
    },
    {
      "tone": "Balanced",
      "toneDescription": "Professional yet human",
      "subject": "Subject line",
      "body": "Body with \\n breaks",
      "estimatedReadTime": "20 seconds",
      "useCase": "Standard workplace communication"
    },
    {
      "tone": "Casual",
      "toneDescription": "Friendly and direct",
      "subject": "Subject line",
      "body": "Body with \\n breaks",
      "estimatedReadTime": "15 seconds",
      "useCase": "Teammates, colleagues you know well"
    }
  ],
  "suggestedRecipient": "Boss / Professor / Client / Teammate",
  "warning": "Optional caveats",
  "successProbability": "75% likely to receive positive response"
}`;

  try {
    const result = await generateWithFallback(systemPrompt, prompt, 0.6);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Email Drafter failed (all models):", error.message);
    return null;
  }
};