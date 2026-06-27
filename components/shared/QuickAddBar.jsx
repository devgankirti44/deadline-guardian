"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Mic, Brain } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MissionAnalyzer from "@/components/intelligence/MissionAnalyzer";

// AI parser
const parseWithAI = async (input) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: { temperature: 0.3, maxOutputTokens: 500, responseMimeType: "application/json" },
    });

    const prompt = `Parse this natural language task input into structured data.
Current date/time: ${new Date().toISOString()}
User input: "${input}"

Return JSON only:
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
- Always return valid JSON`;

    const result = await model.generateContent(prompt);
    const cleaned = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Parse error:", error);
    return parseLocally(input);
  }
};

const parseLocally = (input) => {
  const lower = input.toLowerCase();
  let priority = "medium";
  if (lower.match(/urgent|asap|critical|emergency|now/)) priority = "critical";
  else if (lower.match(/important|high|priority/)) priority = "high";
  else if (lower.match(/low|whenever|someday/)) priority = "low";

  let deadline = null;
  const now = new Date();
  if (lower.includes("tomorrow")) {
    const t = new Date(now); t.setDate(t.getDate() + 1); t.setHours(18, 0, 0, 0);
    deadline = t.toISOString();
  } else if (lower.includes("today")) {
    const t = new Date(now); t.setHours(23, 0, 0, 0);
    deadline = t.toISOString();
  }

  let category = "Work";
  if (lower.match(/meet|call|sync/)) category = "Meeting";
  else if (lower.match(/study|learn|read|course/)) category = "Learning";
  else if (lower.match(/bill|pay|invoice/)) category = "Finance";
  else if (lower.match(/gym|doctor|health/)) category = "Health";
  else if (lower.match(/project|build|develop/)) category = "Project";
  else if (lower.match(/assign|homework|submit/)) category = "Assignment";

  return {
    title: input.substring(0, 60),
    description: "",
    deadline,
    priority,
    estimatedHours: 1,
    category,
  };
};

export const QuickAddBar = ({ onAdd }) => {
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [userId, setUserId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Try to load auth
    import("@/lib/firebase").then(({ onAuthChange }) => {
      if (onAuthChange) {
        const unsub = onAuthChange((u) => u && setUserId(u.uid));
        return () => unsub && unsub();
      }
    }).catch(() => {});
  }, []);

  // Listen for global quick-add events
  useEffect(() => {
    const handleQuickAdd = async (e) => {
      const text = e.detail;
      setInput(text);
      setParsing(true);
      toast.loading("AI parsing your mission...", { id: "parse" });
      try {
        const parsed = await parseWithAI(text);
        setPreview(parsed);
        await onAdd(parsed);
        setInput("");
        setPreview(null);
        toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
      } catch (error) {
        toast.error("Could not parse.", { id: "parse" });
      } finally {
        setParsing(false);
      }
    };
    window.addEventListener("quickadd", handleQuickAdd);
    return () => window.removeEventListener("quickadd", handleQuickAdd);
  }, [onAdd]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || parsing) return;

    setParsing(true);
    toast.loading("AI parsing your mission...", { id: "parse" });
    try {
      const parsed = await parseWithAI(input);
      setPreview(parsed);
      await onAdd(parsed);
      setInput("");
      setPreview(null);
      toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
    } catch (error) {
      toast.error("Could not parse. Try simpler input.", { id: "parse" });
    } finally {
      setParsing(false);
    }
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice not supported in this browser");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
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
    recognition.onerror = () => toast.error("Voice input failed", { id: "voice" });
  };

  const handleAnalyzeClick = () => {
    if (!input.trim()) {
      toast.error("Enter a mission title first");
      return;
    }
    setShowAnalyzer(true);
  };

  const handleAnalyzerComplete = async (enhancedTask) => {
    await onAdd(enhancedTask);
    setShowAnalyzer(false);
    setInput("");
    toast.success("Intelligent mission deployed! 🚀");
  };

  const examples = [
    "Submit project report by friday 5pm urgent",
    "Pay electricity bill tomorrow",
    "Prepare for client meeting in 3 hours important",
    "Study system design 4 hours",
  ];

  const handleExampleClick = async (ex) => {
    if (parsing) return;
    setInput(ex);
    setParsing(true);
    toast.loading("AI parsing your mission...", { id: "parse" });
    try {
      const parsed = await parseWithAI(ex);
      setPreview(parsed);
      await onAdd(parsed);
      setInput("");
      setPreview(null);
      toast.success(`Mission deployed: ${parsed.title}`, { id: "parse" });
    } catch (error) {
      toast.error("Could not parse.", { id: "parse" });
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="mb-3">
      <div className="guardian-panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Sparkles size={12} color="#F59E0B" />
            <span className="panel-title">QUICK MISSION ENTRY</span>
          </div>
          <span className="mono-xs text-text-muted">⚡ AI-POWERED NATURAL LANGUAGE</span>
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
              <Sparkles size={14} color="#F59E0B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
            </div>

            <button
              type="button"
              onClick={handleVoice}
              disabled={parsing}
              className="px-3 transition-colors"
              style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#F59E0B", borderRadius: 2 }}
              title="Voice input"
            >
              <Mic size={14} />
            </button>

            {/* NEW: AI ANALYZE BUTTON */}
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={parsing}
              className="flex items-center gap-1.5"
              style={{
                padding: "8px 16px",
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.4)",
                color: "#A855F7",
                borderRadius: 2,
                fontSize: 12,
                fontWeight: 600,
                cursor: parsing ? "not-allowed" : "pointer",
              }}
              title="Deep AI analysis - effort, feasibility, simulation"
            >
              <Brain size={12} />
              AI ANALYZE
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

          {preview && (
            <div className="mt-3 p-3 flex items-center gap-3 animate-fade-in-up" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 2 }}>
              <Sparkles size={14} color="#10B981" />
              <div className="flex-1">
                <div className="mono-xs font-bold" style={{ color: "#10B981" }}>✓ AI PARSED:</div>
                <div className="mono-xs mt-1" style={{ color: "#E5E5E5" }}>
                  <span style={{ color: "#FCD34D" }}>{preview.title}</span>
                  {preview.deadline && (
                    <span className="ml-3" style={{ color: "#6B7280" }}>
                      📅 {new Date(preview.deadline).toLocaleString()}
                    </span>
                  )}
                  <span className="ml-3" style={{ color: "#F59E0B" }}>{preview.priority?.toUpperCase()}</span>
                  <span className="ml-3" style={{ color: "#6B7280" }}>[{preview.category}]</span>
                </div>
              </div>
            </div>
          )}

          {!input && !preview && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="mono-xs" style={{ color: "#F59E0B", fontSize: 10, fontWeight: "bold" }}>
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
                    borderRadius: 3,
                    fontSize: 10,
                    cursor: parsing ? "not-allowed" : "pointer",
                    opacity: parsing ? 0.5 : 1,
                  }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* MISSION INTELLIGENCE ANALYZER MODAL */}
      {showAnalyzer && (
        <MissionAnalyzer
          userId={userId}
          initialTitle={input}
          initialDescription=""
          onComplete={handleAnalyzerComplete}
          onClose={() => setShowAnalyzer(false)}
        />
      )}
    </div>
  );
};