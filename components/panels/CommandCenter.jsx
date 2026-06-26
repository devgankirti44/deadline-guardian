"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Cpu, Terminal } from "lucide-react";
import { createChatSession, sendChatMessage } from "@/lib/gemini";

// Simple chat function using Gemini directly
// Pure Gemini chat - no fake fallback
const askGemini = async (message, tasks, orchestratorData) => {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    );
    
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest  ",
      systemInstruction: `
You are GUARDIAN, an AI mission control commander protecting users from missing deadlines.

PERSONALITY: Direct, authoritative, action-focused. Like NASA mission control.
TONE: Use mission control terminology — "Operator", "Mission", "Execute", "Priority One"

Current time: ${new Date().toISOString()}
User: ${tasks?.filter(t => !t.completed).length || 0} active missions

Active Mission Context:
${JSON.stringify(tasks?.filter(t => !t.completed).slice(0, 5).map(t => ({
  title: t.title,
  risk: t.riskLevel,
  hoursLeft: t.deadline ? Math.round((new Date(t.deadline) - new Date()) / 3600000) : null,
  category: t.category,
})))}

System Status: ${orchestratorData?.systemStatus || "STABLE"}

RULES:
- Maximum 80 words per response
- Reference actual mission names from context
- Be specific and actionable
- No markdown formatting
- Pure mission control communication
      `,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });
    
    const result = await model.generateContent(message);
    return result.response.text();
    
  } catch (error) {
    console.error("Gemini error:", error);
    
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return "⚠ GUARDIAN STANDBY: API quota limit reached. Free tier: 5 requests/minute. Please wait 60 seconds before next query.";
    }
    
    if (error.message?.includes("503")) {
      return "⚠ GUARDIAN STANDBY: Gemini AI servers experiencing high demand. Retry in 30 seconds.";
    }
    
    return "⚠ GUARDIAN OFFLINE: Communication disrupted. Check API configuration and retry.";
  }
};

export const CommandCenter = ({
  orchestratorData = null,
  tasks = [],
}) => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        orchestratorData?.commandBriefing ||
        "GUARDIAN ONLINE. All monitoring systems active. Awaiting your command.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update initial message when orchestrator data arrives
  useEffect(() => {
    if (orchestratorData?.commandBriefing) {
      setMessages([
        {
          role: "system",
          content: orchestratorData.commandBriefing,
          timestamp: new Date(),
        },
      ]);
    }
  }, [orchestratorData?.commandBriefing]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMsg = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const response = await askGemini(
      input.trim(),
      tasks,
      orchestratorData
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "guardian",
        content: response,
        timestamp: new Date(),
      },
    ]);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const quickCommands = [
    "What is my top priority right now?",
    "Which deadline am I most likely to miss?",
    "Give me a 30-minute action plan",
    "What should I focus on today?",
  ];

  return (
    <div className="guardian-panel h-full flex flex-col">
      {/* Header */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cpu size={12} color="#F59E0B" />
          <span className="panel-title">AI COMMAND CENTER</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-green w-2 h-2" />
          <span className="mono-xs" style={{ color: "#10B981" }}>
            GUARDIAN ONLINE
          </span>
        </div>
      </div>

      {/* System Status Summary */}
      {orchestratorData && (
        <div
          className="px-4 py-2 flex items-center justify-between flex-shrink-0"
          style={{
            background: "#0D0D0D",
            borderBottom: "1px solid #2A2A2A",
          }}
        >
          <div className="flex items-center gap-4">
            <div>
              <span className="mono-xs text-text-muted">
                READINESS:{" "}
              </span>
              <span
                className="mono-xs font-bold"
                style={{ color: "#F59E0B" }}
              >
                {orchestratorData.missionReadiness || 0}%
              </span>
            </div>
            <div>
              <span className="mono-xs text-text-muted">THREATS: </span>
              <span
                className="mono-xs font-bold"
                style={{ color: "#EF4444" }}
              >
                {orchestratorData.threatsDetected || 0}
              </span>
            </div>
            <div>
              <span className="mono-xs text-text-muted">ACTIVE: </span>
              <span
                className="mono-xs font-bold"
                style={{ color: "#10B981" }}
              >
                {orchestratorData.activeMissions || 0}
              </span>
            </div>
          </div>
          <span
            className="mono-xs font-bold"
            style={{
              color:
                orchestratorData.systemStatus === "CRITICAL"
                  ? "#EF4444"
                  : orchestratorData.systemStatus === "WARNING"
                  ? "#F59E0B"
                  : "#10B981",
            }}
          >
            {orchestratorData.systemStatus}
          </span>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3 scan-effect"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            {msg.role !== "user" && (
              <div
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5"
                style={{
                  border: "1px solid #F59E0B",
                  background: "rgba(245,158,11,0.1)",
                }}
              >
                <Terminal size={10} color="#F59E0B" />
              </div>
            )}
            <div
              className="max-w-xs"
              style={{
                maxWidth: "78%",
              }}
            >
              <div
                className="px-3 py-2"
                style={{
                  background:
                    msg.role === "user"
                      ? "rgba(245,158,11,0.12)"
                      : "#1A1A1A",
                  border:
                    msg.role === "user"
                      ? "1px solid rgba(245,158,11,0.3)"
                      : "1px solid #2A2A2A",
                  borderRadius: "2px",
                }}
              >
                {msg.role !== "user" && (
                  <div
                    className="mono-xs font-bold mb-1"
                    style={{ color: "#F59E0B" }}
                  >
                    GUARDIAN //
                  </div>
                )}
                <p
                  className="mono-xs leading-relaxed"
                  style={{
                    color: msg.role === "user" ? "#FCD34D" : "#A3A3A3",
                  }}
                >
                  {msg.content}
                </p>
              </div>
              <div
                className="mono-xs mt-0.5 px-1"
                style={{
                  color: "#4B5563",
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
            {msg.role === "user" && (
              <div
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5"
                style={{
                  border: "1px solid rgba(245,158,11,0.3)",
                  background: "rgba(245,158,11,0.08)",
                  fontSize: "10px",
                }}
              >
                OP
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{
                border: "1px solid #F59E0B",
                background: "rgba(245,158,11,0.1)",
              }}
            >
              <Terminal size={10} color="#F59E0B" />
            </div>
            <div
              className="px-3 py-2 flex items-center gap-2"
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "2px",
              }}
            >
              <div
                className="guardian-loader"
                style={{ width: 12, height: 12, borderWidth: 2 }}
              />
              <span className="mono-xs text-text-muted">
                PROCESSING...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div
        className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
        style={{ borderTop: "1px solid #2A2A2A" }}
      >
        {quickCommands.map((cmd, i) => (
          <button
            key={i}
            onClick={() => setInput(cmd)}
            className="flex-shrink-0 mono-xs px-2 py-1 transition-all hover:border-amber-500"
            style={{
              background: "#0D0D0D",
              border: "1px solid #2A2A2A",
              color: "#6B7280",
              borderRadius: "2px",
              fontSize: "9px",
              whiteSpace: "nowrap",
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="p-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: "1px solid #2A2A2A" }}
      >
        <input
          className="guardian-input flex-1"
          placeholder="ENTER COMMAND // ASK GUARDIAN..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="btn-amber flex items-center gap-1.5 flex-shrink-0"
          style={{ padding: "8px 14px" }}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
};