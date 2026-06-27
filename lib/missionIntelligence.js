"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

const MODEL_CHAIN = [
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash-001",
  "gemini-flash-latest",
];

const getAgent = (systemPrompt, modelName = MODEL_CHAIN[0]) => {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });
};

const generateWithFallback = async (systemPrompt, prompt) => {
  let lastError = null;
  for (const modelName of MODEL_CHAIN) {
    try {
      const agent = getAgent(systemPrompt, modelName);
      const result = await agent.generateContent(prompt);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err.message || "";
      if (msg.includes("429") || msg.includes("503") || msg.includes("quota")) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

const safeJSON = (text, fallback = {}) => {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
};

// ═══════════════════════════════════════════════
// AGENT 1: TASK TYPE DETECTOR
// Identifies what kind of task this is
// ═══════════════════════════════════════════════
export const detectTaskType = async (taskTitle, description = "") => {
  const systemPrompt = `
You are the Task Type Detection Agent for Deadline Guardian.
Analyze the task and classify it into one of these categories.
Output: Valid JSON only.
  `;

  const prompt = `
Analyze this task and classify it:

Title: "${taskTitle}"
Description: "${description}"

Categories:
- "course" - Learning courses, tutorials, videos
- "assignment" - Academic assignments, essays, papers
- "interview_prep" - Interview preparation, coding practice
- "coding_project" - Building software, apps, websites
- "exam_prep" - Studying for exams, tests
- "work_task" - Office work, deliverables, reports
- "personal" - Personal tasks, errands, habits
- "other" - Doesn't fit above

Return JSON:
{
  "taskType": "course",
  "confidence": 0.95,
  "reasoning": "Brief explanation why",
  "suggestedQuestions": [
    {
      "id": "q1",
      "question": "Specific question for this task type",
      "field": "field_name",
      "type": "number|text|select",
      "options": ["option1", "option2"] // if type is select
    }
  ]
}

Examples for different types:

For "course" tasks, ask:
- Number of videos/modules
- Average duration per video (minutes)
- Are there exercises?
- Are there projects?

For "assignment" tasks, ask:
- Number of pages/words
- Is research required?
- Number of references needed
- Topic complexity (easy/medium/hard)

For "interview_prep" tasks, ask:
- Company name
- Number of topics to cover
- Difficulty level
- Number of practice sessions planned

For "coding_project" tasks, ask:
- Number of major features
- Familiar with tech stack? (yes/no)
- Solo or team?
- MVP or full version?

For "exam_prep" tasks, ask:
- Number of subjects/chapters
- Difficulty level
- Have notes prepared? (yes/no)
- Previous practice tests?

Return 3-5 relevant questions for the detected type.
  `;

  try {
    const result = await generateWithFallback(systemPrompt, prompt);
    return safeJSON(result.response.text(), {
      taskType: "other",
      confidence: 0.5,
      reasoning: "Could not determine",
      suggestedQuestions: [],
    });
  } catch (error) {
    console.error("Task Type Detection failed:", error);
    return {
      taskType: "other",
      confidence: 0,
      reasoning: "Detection failed",
      suggestedQuestions: [],
    };
  }
};

// ═══════════════════════════════════════════════
// AGENT 2: EFFORT ESTIMATION ENGINE
// Calculates realistic effort needed
// ═══════════════════════════════════════════════
export const estimateEffort = async (taskData) => {
  const systemPrompt = `
You are the Effort Estimation Agent for Deadline Guardian.
You provide realistic time estimates based on task details.
Be honest about how long things ACTUALLY take, not optimistic.
Output: Valid JSON only.
  `;

  const prompt = `
Calculate realistic effort for this task:

Task: ${JSON.stringify(taskData, null, 2)}

Provide effort breakdown:
- Learning/research hours
- Active work hours  
- Practice/exercises hours
- Revision/review hours
- Buffer time (15% for unexpected issues)

Be REALISTIC. Most people underestimate by 30-50%.

Return JSON:
{
  "totalHours": 42,
  "breakdown": {
    "learning": 15,
    "practice": 20,
    "revision": 5,
    "buffer": 2
  },
  "reasoning": "Detailed explanation of estimate",
  "comparisons": [
    "Similar courses typically take 35-45 hours",
    "Including practice doubles the time"
  ],
  "warning": "Common mistake: people allocate 25 hours but actually need 42"
}
  `;

  try {
    const result = await generateWithFallback(systemPrompt, prompt);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Effort Estimation failed:", error);
    return null;
  }
};

// ═══════════════════════════════════════════════
// AGENT 3: FEASIBILITY ANALYZER
// Determines if task is realistically completable
// ═══════════════════════════════════════════════
export const analyzeFeasibility = async (taskData, availableHoursPerDay, daysAvailable, existingTasksHours = 0) => {
  const systemPrompt = `
You are the Feasibility Analysis Agent for Deadline Guardian.
You assess whether tasks are realistically completable.
You distinguish between "mathematically possible" and "humanly realistic".
Output: Valid JSON only.
  `;

  const totalAvailableHours = availableHoursPerDay * daysAvailable;
  const netAvailableHours = totalAvailableHours - existingTasksHours;
  const requiredHoursPerDay = taskData.totalHours / daysAvailable;

  const prompt = `
Analyze feasibility of completing this task:

REQUIRED EFFORT: ${taskData.totalHours} hours
TIME AVAILABLE: ${daysAvailable} days
HOURS PER DAY AVAILABLE: ${availableHoursPerDay}
HOURS COMMITTED TO OTHER TASKS: ${existingTasksHours}
NET HOURS AVAILABLE: ${netAvailableHours}
REQUIRED HOURS/DAY: ${requiredHoursPerDay.toFixed(1)}

Task details: ${JSON.stringify(taskData)}

Analyze:
1. Is this mathematically possible? (enough hours exist)
2. Is this humanly realistic? (sustainable daily effort)
3. Success probability (0-100)
4. Reality score (compares required vs typical capacity)

For humans:
- 1-2 hours/day = Easy, sustainable
- 2-4 hours/day = Moderate, requires discipline
- 4-6 hours/day = Hard, intensive
- 6-8 hours/day = Very hard, sacrifices needed
- 8+ hours/day = Unrealistic for most people

Return JSON:
{
  "isMathematicallyPossible": true,
  "isHumanlyRealistic": false,
  "successProbability": 45,
  "realityScore": 38,
  "requiredHoursPerDay": 5.6,
  "verdict": "RISKY",
  "reasoning": "While 5.6 hours/day is mathematically possible, sustaining this for X days is unrealistic for most people.",
  "warnings": [
    "Requires 5.6 hours of focused work daily",
    "Most people sustain 2-3 hours of deep work",
    "Buffer time is minimal"
  ],
  "recommendations": [
    "Extend deadline by 5 days for 73% success probability",
    "Reduce scope to core 80% for higher success",
    "Negotiate flexible deadline"
  ]
}

Verdict options: "REALISTIC", "CHALLENGING", "RISKY", "UNREALISTIC"
  `;

  try {
    const result = await generateWithFallback(systemPrompt, prompt);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Feasibility Analysis failed:", error);
    return null;
  }
};

// ═══════════════════════════════════════════════
// AGENT 4: WHAT-IF SIMULATOR
// Calculates impact of different deadlines
// ═══════════════════════════════════════════════
export const simulateDeadlines = async (taskData, totalHours, currentAvailableHoursPerDay) => {
  const systemPrompt = `
You are the Deadline Simulation Agent for Deadline Guardian.
You calculate the impact of different completion timelines.
Output: Valid JSON only.
  `;

  const prompt = `
Calculate impact of different deadlines for this task:

TOTAL HOURS REQUIRED: ${totalHours}
USER'S TYPICAL AVAILABILITY: ${currentAvailableHoursPerDay} hours/day

Simulate 5 different deadline scenarios:

Return JSON:
{
  "scenarios": [
    {
      "days": 30,
      "hoursPerDay": ${(totalHours/30).toFixed(1)},
      "successProbability": 90,
      "stressLevel": "LOW",
      "feasibility": "EASY",
      "tradeoffs": "Most relaxed pace, room for other commitments"
    },
    {
      "days": 14,
      "hoursPerDay": ${(totalHours/14).toFixed(1)},
      "successProbability": 75,
      "stressLevel": "MEDIUM",
      "feasibility": "MODERATE",
      "tradeoffs": "Requires consistent daily effort"
    },
    {
      "days": 7,
      "hoursPerDay": ${(totalHours/7).toFixed(1)},
      "successProbability": 50,
      "stressLevel": "HIGH",
      "feasibility": "INTENSIVE",
      "tradeoffs": "Full week commitment, minimal flexibility"
    },
    {
      "days": 3,
      "hoursPerDay": ${(totalHours/3).toFixed(1)},
      "successProbability": 25,
      "stressLevel": "VERY_HIGH",
      "feasibility": "EXTREME",
      "tradeoffs": "Requires cancelling other commitments"
    },
    {
      "days": 1,
      "hoursPerDay": ${totalHours.toFixed(1)},
      "successProbability": 5,
      "stressLevel": "EXTREME",
      "feasibility": "UNREALISTIC",
      "tradeoffs": "Requires sacrificing sleep, all other commitments"
    }
  ],
  "recommendedDays": 14,
  "recommendedReason": "Best balance of feasibility and timely completion"
}

Be honest about success probability based on hours/day required.
  `;

  try {
    const result = await generateWithFallback(systemPrompt, prompt);
    return safeJSON(result.response.text(), null);
  } catch (error) {
    console.error("Deadline Simulation failed:", error);
    return null;
  }
};