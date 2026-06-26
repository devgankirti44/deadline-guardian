"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Mic } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Smart task parser using Gemini
const parseWithAI = async (input) => {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest ",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    });

    const prompt = `Parse this natural language task input into structured data.
Current date/time: ${new Date().toISOString()}
User input: "${input}"

Extract and return JSON only:
{
  "title": "Clear concise task title",
  "description": "Additional context if any",
  "deadline": "ISO 8601 datetime or null",
  "priority": "critical|high|medium|low",
  "estimatedHours": 2,
  "category": "Work|Project|Assignment|Meeting|Personal|Finance|Health|Learning|Other"
}

Rules:
- "tomorrow" = tomorrow 6pm
- "by friday" = next Friday 5pm
- "urgent/asap/critical" = critical priority
- "important" = high priority
- "in 2 hours" = now + 2 hours
- If time mentioned use it, else default 6pm
- Estimate hours based on task complexity
- Pick best category from list
- Always return valid JSON`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Parse error:", error);
    return parseLocally(input);
  }
};

// Fallback local parser
const parseLocally = (input) => {
  const lower = input.toLowerCase();
  
  let priority = "medium";
  if (lower.match(/urgent|asap|critical|emergency|now/)) priority = "critical";
  else if (lower.match(/important|high|priority/)) priority = "high";
  else if (lower.match(/low|whenever|someday/)) priority = "low";

  let deadline = null;
  const now = new Date();
  if (lower.includes("tomorrow")) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    t.setHours(18, 0, 0, 0);
    deadline = t.toISOString();
  } else if (lower.includes("today")) {
    const t = new Date(now);
    t.setHours(23, 0, 0, 0);
    deadline = t.toISOString();
  } else if (lower.match(/friday|monday|tuesday|wednesday|thursday|saturday|sunday/i)) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const targetDay = days.findIndex(d => lower.includes(d));
    if (targetDay !== -1) {
      const t = new Date(now);
      const diff = (targetDay - t.getDay() + 7) % 7 || 7;
      t.setDate(t.getDate() + diff);
      t.setHours(17, 0, 0, 0);
      deadline = t.toISOString();
    }
  } else if (lower.match(/in (\d+) hours?/)) {
    const hours = parseInt(lower.match(/in (\d+) hours?/)[1]);
    deadline = new Date(now.getTime() + hours * 3600000).toISOString();
  }

  let category = "Work";
  if (lower.match(/meet|call|sync/)) category = "Meeting";
  else if (lower.match(/study|learn|read|course/)) category = "Learning";
  else if (lower.match(/bill|pay|invoice|tax/)) category = "Finance";
  else if (lower.match(/gym|doctor|health|exercise/)) category = "Health";
  else if (lower.match(/personal|family|friend/)) category = "Personal";
  else if (lower.match(/project|build|develop/)) category = "Project";
  else if (lower.match(/assign|homework|submit/)) category = "Assignment";

  let estimatedHours = 1;
  const hourMatch = lower.match(/(\d+)\s*hours?/);
  if (hourMatch) estimatedHours = parseInt(hourMatch[1]);
  else if (lower.match(/quick|short|brief/)) estimatedHours = 0.5;
  else if (lower.match(/big|long|major/)) estimatedHours = 4;

  let title = input
    .replace(/by (today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, "")
    .replace(/in \d+ hours?/gi, "")
    .replace(/urgent|asap|critical|important|high priority/gi, "")
    .replace(/\d+\s*hours?/gi, "")
    .trim();
  
  if (title.length > 60) title = title.substring(0, 60) + "...";

  return {
    title: title || input,
    description: "",
    deadline,
    priority,
    estimatedHours,
    category,
  };
};

export const QuickAddBar = ({ onAdd }) => {
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  // Listen for quick-add events from empty state buttons
  useEffect(() => {
    const handleQuickAdd = async (e) => {
      const text = e.detail;
      setInput(text);
      setParsing(true);
      toast.loading("AI parsing your mission...", { id: "parse" });

      try {
        const parsed = await parseWithAI(text);
        setPreview(parsed);
        setTimeout(async () => {
          await onAdd(parsed);
          // Voice announcement
const voiceEngine = (await import("@/lib/voiceEngine")).getVoiceEngine();
if (voiceEngine) {
  voiceEngine.taskAdded(parsed.title, parsed.deadline);
}
          setInput("");
          setPreview(null);
          toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
        }, 800);
      } catch (error) {
        toast.error("Could not parse.", { id: "parse" });
      } finally {
        setParsing(false);
      }
    };

    window.addEventListener('quickadd', handleQuickAdd);
    return () => window.removeEventListener('quickadd', handleQuickAdd);
  }, [onAdd]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || parsing) return;

    setParsing(true);
    toast.loading("AI parsing your mission...", { id: "parse" });

    try {
      const parsed = await parseWithAI(input);
      setPreview(parsed);
     setTimeout(async () => {
  await onAdd(parsed);
  
  // 🎤 VOICE ANNOUNCEMENT
  try {
   setTimeout(async () => {
  await onAdd(parsed);
  setInput("");
  setPreview(null);
  toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
}, 800);
  } catch (e) {
    console.log("Voice unavailable");
  }
  
  setInput("");
  setPreview(null);
  toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
}, 800);
    } catch (error) {
      toast.error("Could not parse. Try simpler input.", { id: "parse" });
    } finally {
      setParsing(false);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    toast.loading("Listening... speak now", { id: "voice" });
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast.success(`Heard: "${transcript}"`, { id: "voice" });
      setTimeout(() => handleSubmit(), 500);
    };

    recognition.onerror = () => {
      toast.error("Voice input failed", { id: "voice" });
    };
  };

  const examples = [
    "Submit project report by friday 5pm urgent",
    "Pay electricity bill tomorrow",
    "Prepare for client meeting in 3 hours important",
    "Study system design 4 hours",
  ];

  // Click example → auto-deploy
  const handleExampleClick = async (ex) => {
    if (parsing) return;
    setInput(ex);
    setParsing(true);
    toast.loading("AI parsing your mission...", { id: "parse" });
setTimeout(async () => {
  await onAdd(parsed);
  
  // 🎤 VOICE ANNOUNCEMENT
  try {
    const { getVoiceEngine } = await import("@/lib/voiceEngine");
    const engine = getVoiceEngine();
    if (engine) {
      engine.taskAdded(parsed.title, parsed.deadline);
    }
  } catch (e) {
    console.log("Voice unavailable");
  }
  
  setInput("");
  setPreview(null);
  toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
}, 800);
    
  };

  return (
    <div className="mb-3">
      <div className="guardian-panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Sparkles size={12} color="#F59E0B" />
            <span className="panel-title">QUICK MISSION ENTRY</span>
          </div>
          <span className="mono-xs text-text-muted">
            ⚡ AI-POWERED NATURAL LANGUAGE
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                className="guardian-input pl-9"
                placeholder='Type naturally: "Submit project by friday 5pm urgent"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={parsing}
                style={{ fontSize: "13px", padding: "10px 12px 10px 36px" }}
              />
              <Sparkles 
                size={14} 
                color="#F59E0B" 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.6,
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleVoice}
              disabled={parsing}
              className="px-3 transition-colors"
              style={{
                background: "transparent",
                border: "1px solid #2A2A2A",
                color: "#F59E0B",
                borderRadius: "2px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              title="Voice input"
            >
              <Mic size={14} />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || parsing}
              className="btn-amber flex items-center gap-1.5"
              style={{ padding: "8px 16px" }}
            >
              {parsing ? (
                <>
                  <div className="guardian-loader" style={{ width: 12, height: 12, borderWidth: 2 }} />
                  PARSING
                </>
              ) : (
                <>
                  <Send size={12} />
                  DEPLOY
                </>
              )}
            </button>
          </div>

          {/* AI Parsed Preview */}
          {preview && (
            <div 
              className="mt-3 p-3 flex items-center gap-3 animate-fade-in-up"
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "2px",
              }}
            >
              <Sparkles size={14} color="#10B981" />
              <div className="flex-1">
                <div className="mono-xs font-bold" style={{ color: "#10B981" }}>
                  ✓ AI PARSED:
                </div>
                <div className="mono-xs mt-1" style={{ color: "#E5E5E5" }}>
                  <span style={{ color: "#FCD34D" }}>{preview.title}</span>
                  {preview.deadline && (
                    <span className="ml-3" style={{ color: "#6B7280" }}>
                      📅 {new Date(preview.deadline).toLocaleString()}
                    </span>
                  )}
                  <span className="ml-3" style={{ color: "#F59E0B" }}>
                    {preview.priority?.toUpperCase()}
                  </span>
                  <span className="ml-3" style={{ color: "#6B7280" }}>
                    [{preview.category}]
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CLICKABLE Example chips - auto-deploys on click */}
          {!input && !preview && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="mono-xs" style={{ color: "#F59E0B", fontSize: "10px", fontWeight: "bold" }}>
                ⚡ CLICK TO TRY:
              </span>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExampleClick(ex)}
                  disabled={parsing}
                  className="mono-xs px-3 py-1 transition-all"
                  style={{
                    background: "rgba(245,158,11,0.05)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#FCD34D",
                    borderRadius: "3px",
                    fontSize: "10px",
                    cursor: parsing ? "not-allowed" : "pointer",
                    opacity: parsing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!parsing) {
                      e.currentTarget.style.background = "rgba(245,158,11,0.15)";
                      e.currentTarget.style.borderColor = "#F59E0B";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.05)";
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.25)";
                    e.currentTarget.style.color = "#FCD34D";
                  }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};