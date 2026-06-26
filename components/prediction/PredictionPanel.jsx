"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle, AlertTriangle, XCircle, Brain, Sparkles,
  ArrowRight, Calendar, Scissors, Users, Headphones,
  Trash2, Zap, ChevronDown, ChevronUp,
  CreditCard, Wallet, Video, Github, FileText,
  Youtube, GraduationCap, Mail, Briefcase, Code,
  Cloud, MessageSquare, Globe, Check,
} from "lucide-react";
import {
  categorizeIntoSlots,
  generateSkipActions,
  assessWorkload,
} from "@/lib/predictionEngine";
import toast from "react-hot-toast";

const ACTION_ICONS = {
  reschedule: Calendar,
  break_down: Scissors,
  delegate: Users,
  passive_mode: Headphones,
  drop: Trash2,
  accountability: Zap,
};

// ═══════════════════════════════════════════════
// 🎯 SMART INTEGRATION DETECTOR
// Returns integration buttons based on task content
// ═══════════════════════════════════════════════
const getIntegrationsForTask = (task) => {
  const text = `${task.title} ${task.description || ""} ${task.category || ""}`.toLowerCase();
  const integrations = [];

  // 💰 FINANCE — Payments, bills
  if (/pay|bill|recharge|emi|rent|upi|electricity|water|gas|credit|debit|finance|money|loan|insurance/i.test(text)) {
    integrations.push(
      { id: "gpay", label: "Google Pay", icon: CreditCard, color: "#4285F4", url: "https://pay.google.com" },
      { id: "paytm", label: "Paytm", icon: Wallet, color: "#00BAF2", url: "https://paytm.com" },
      { id: "phonepe", label: "PhonePe", icon: Wallet, color: "#5F259F", url: "https://www.phonepe.com" }
    );
    return integrations;
  }

  // 📹 MEETINGS — Calls, zoom, meet
  if (/meet|call|zoom|interview|standup|sync|discussion|conference|webinar|presentation/i.test(text)) {
    integrations.push(
      { id: "meet", label: "Google Meet", icon: Video, color: "#00897B", url: "https://meet.google.com/new" },
      { id: "zoom", label: "Zoom", icon: Video, color: "#2D8CFF", url: "https://zoom.us/start/videomeeting" },
      { id: "calendar", label: "Calendar", icon: Calendar, color: "#4285F4", url: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(task.title)}` }
    );
    return integrations;
  }

  // 💻 DEVELOPMENT — Code, GitHub, deploy
  if (/code|github|deploy|bug|feature|pull request|pr|commit|repo|branch|merge|api|backend|frontend|develop/i.test(text)) {
    integrations.push(
      { id: "github", label: "GitHub", icon: Github, color: "#FAFAFA", url: "https://github.com" },
      { id: "vscode", label: "VS Code", icon: Code, color: "#007ACC", url: "vscode://" },
      { id: "vercel", label: "Vercel", icon: Cloud, color: "#FAFAFA", url: "https://vercel.com/dashboard" }
    );
    return integrations;
  }

  // 📧 EMAIL / COMMUNICATION
  if (/email|mail|gmail|reply|send|inbox|message|outlook|professor|client/i.test(text)) {
    integrations.push(
      { id: "gmail", label: "Gmail", icon: Mail, color: "#EA4335", url: `https://mail.google.com/mail/u/0/#inbox?compose=new` },
      { id: "outlook", label: "Outlook", icon: Mail, color: "#0078D4", url: "https://outlook.live.com/mail" }
    );
    return integrations;
  }

  // 📚 LEARNING — Courses, study
  if (/learn|study|course|tutorial|lecture|read|book|node|react|python|java|udemy|coursera|youtube|chapter/i.test(text)) {
    integrations.push(
      { id: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(task.title)}` },
      { id: "udemy", label: "Udemy", icon: GraduationCap, color: "#A435F0", url: "https://www.udemy.com/home/my-courses/" },
      { id: "coursera", label: "Coursera", icon: GraduationCap, color: "#0056D2", url: "https://www.coursera.org/" }
    );
    return integrations;
  }

  // 📊 PROJECT / WORK — Reports, documents
  if (/project|report|document|doc|slide|presentation|proposal|submit|assignment|deliverable/i.test(text)) {
    integrations.push(
      { id: "docs", label: "Google Docs", icon: FileText, color: "#4285F4", url: "https://docs.google.com/document/u/0/" },
      { id: "slides", label: "Google Slides", icon: FileText, color: "#F4B400", url: "https://docs.google.com/presentation/u/0/" },
      { id: "drive", label: "Drive", icon: Cloud, color: "#34A853", url: "https://drive.google.com" }
    );
    return integrations;
  }

  // 💼 INTERVIEW / JOB
  if (/interview|job|resume|linkedin|hire|application|leetcode|hackerrank/i.test(text)) {
    integrations.push(
      { id: "linkedin", label: "LinkedIn", icon: Briefcase, color: "#0A66C2", url: "https://www.linkedin.com" },
      { id: "leetcode", label: "LeetCode", icon: Code, color: "#FFA116", url: "https://leetcode.com" }
    );
    return integrations;
  }

  // 💬 SOCIAL / TEAM
  if (/slack|team|chat|whatsapp|telegram|discord/i.test(text)) {
    integrations.push(
      { id: "slack", label: "Slack", icon: MessageSquare, color: "#4A154B", url: "https://slack.com/signin" },
      { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "#25D366", url: "https://web.whatsapp.com" }
    );
    return integrations;
  }

  // 🌐 DEFAULT — Google Search
  integrations.push(
    { id: "search", label: "Google Search", icon: Globe, color: "#4285F4", url: `https://www.google.com/search?q=${encodeURIComponent(task.title)}` },
    { id: "calendar", label: "Add to Calendar", icon: Calendar, color: "#4285F4", url: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(task.title)}` }
  );
  return integrations;
};

// ═══════════════════════════════════════════════
// 🎨 INTEGRATION BUTTON COMPONENT
// ═══════════════════════════════════════════════
const IntegrationButton = ({ integration, onClick }) => {
  const Icon = integration.icon;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.open(integration.url, "_blank");
        toast.success(`Opening ${integration.label}...`, {
          icon: "🚀",
          style: { background: "#0D0D0D", color: "#FAFAFA", border: `1px solid ${integration.color}40` },
        });
        if (onClick) onClick();
      }}
      className="flex items-center gap-1.5 transition-all group"
      style={{
        padding: "6px 12px",
        background: `${integration.color}10`,
        border: `1px solid ${integration.color}30`,
        borderRadius: "6px",
        color: integration.color,
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${integration.color}20`;
        e.currentTarget.style.borderColor = integration.color;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${integration.color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${integration.color}10`;
        e.currentTarget.style.borderColor = `${integration.color}30`;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Icon size={12} />
      {integration.label}
    </button>
  );
};

// ═══════════════════════════════════════════════
// 🎯 SLOT TASK COMPONENT (with integrations)
// ═══════════════════════════════════════════════
const SlotTask = ({ task, slotType, onComplete, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const probability = task.completionProbability;
  const slotConfig = {
    likely_complete: {
      color: "#10B981",
      bg: "rgba(16,185,129,0.05)",
      borderColor: "rgba(16,185,129,0.2)",
      icon: CheckCircle,
    },
    uncertain: {
      color: "#FCD34D",
      bg: "rgba(252,211,77,0.05)",
      borderColor: "rgba(252,211,77,0.2)",
      icon: AlertTriangle,
    },
    likely_skip: {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.05)",
      borderColor: "rgba(239,68,68,0.2)",
      icon: XCircle,
    },
  };
  
  const cfg = slotConfig[slotType];
  const hoursLeft = task.deadline
    ? Math.round((new Date(task.deadline) - new Date()) / 3600000)
    : null;
  
  const skipActions = slotType === "likely_skip" ? generateSkipActions(task) : [];
  const integrations = getIntegrationsForTask(task);
  
  return (
    <div
      style={{
        background: cfg.bg,
        borderRadius: "12px",
        padding: "16px 18px",
        borderLeft: `2px solid ${cfg.color}`,
        marginBottom: "10px",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Probability Circle */}
        <div className="relative flex-shrink-0">
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke={cfg.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(probability / 100) * 125.6} 125.6`}
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              color: cfg.color,
              fontSize: "11px",
              fontWeight: "700",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {probability}%
          </div>
        </div>
        
        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 style={{ color: "#FAFAFA", fontSize: "15px", fontWeight: "600" }}>
              {task.title}
            </h4>
            <span
              style={{
                color: cfg.color,
                fontSize: "9px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                padding: "2px 8px",
                background: `${cfg.color}15`,
                borderRadius: "100px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {task.riskLevel?.toUpperCase() || "NOMINAL"}
            </span>
          </div>
          
          <p style={{ color: "#A3A3A3", fontSize: "12px", marginBottom: "8px" }}>
            <Sparkles size={10} className="inline mr-1" color={cfg.color} />
            <span style={{ fontStyle: "italic" }}>
              AI: {task.predictionReason}
            </span>
          </p>
          
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {hoursLeft !== null && (
              <span style={{ color: hoursLeft < 24 ? "#EF4444" : "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                ⏱ {hoursLeft <= 0 ? "OVERDUE" : hoursLeft < 24 ? `${hoursLeft}h` : `${Math.floor(hoursLeft / 24)}d`}
              </span>
            )}
            <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
              ~{task.estimatedHours || 1}h
            </span>
            {task.category && (
              <span style={{ color: "#6B7280", fontSize: "11px" }}>
                {task.category}
              </span>
            )}
          </div>
          
          {/* ═══════════════════════════════════════════════
              🚀 INTEGRATION BUTTONS — Replace Focus/Mark Done
              ═══════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 flex-wrap">
            {integrations.map((integration) => (
              <IntegrationButton key={integration.id} integration={integration} />
            ))}
            
            {/* Mark Done — always visible */}
            <button
              onClick={() => {
                onComplete(task.id);
                toast.success("Mission complete! 🎉");
              }}
              className="flex items-center gap-1.5 transition-all"
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: "#10B981",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                marginLeft: "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.1)";
                e.currentTarget.style.borderColor = "#10B981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
              }}
            >
              <Check size={12} />
              Done
            </button>
          </div>
          
          {/* Recovery Actions for likely_skip tasks */}
          {slotType === "likely_skip" && skipActions.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowActions(!showActions)}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  padding: "8px 12px",
                  background: "rgba(239,68,68,0.1)",
                  color: "#EF4444",
                  border: "1px dashed rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.1em",
                }}
              >
                {showActions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showActions ? "HIDE RECOVERY ACTIONS" : "RECOVERY OPTIONS"}
              </button>
              
              {showActions && (
                <div className="mt-3 space-y-2">
                  {skipActions.map((action, i) => {
                    const ActionIcon = ACTION_ICONS[action.action] || Zap;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (action.action === "drop") {
                            if (confirm(`Drop "${task.title}"?`)) {
                              onDelete(task.id);
                              toast.success("Mission dropped");
                            }
                          } else {
                            toast.success(`Action: ${action.label}`);
                          }
                        }}
                        className="w-full text-left flex items-center gap-3 transition-all"
                        style={{
                          padding: "10px 12px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = `${cfg.color}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{action.icon}</span>
                        <div className="flex-1">
                          <div style={{ color: "#FAFAFA", fontSize: "12px", fontWeight: "500" }}>
                            {action.label}
                          </div>
                          <div style={{ color: "#6B7280", fontSize: "10px" }}>
                            {action.description}
                          </div>
                        </div>
                        <ArrowRight size={12} color="#6B7280" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN PREDICTION PANEL
// ═══════════════════════════════════════════════
export default function PredictionPanel({ tasks, onFocus, onComplete, onDelete }) {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
  }, []);
  
  const slots = categorizeIntoSlots(tasks);
  const workload = assessWorkload(slots);
  
  const hasAnyTasks = slots.likely_complete.length + slots.uncertain.length + slots.likely_skip.length > 0;
  
  if (!hasAnyTasks) {
    return null;
  }
  
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: "44px",
            height: "44px",
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), transparent)",
            border: "1px solid #A855F7",
            borderRadius: "12px",
          }}
        >
          <Brain size={20} color="#A855F7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
              Behavioral Prediction + Smart Integrations
            </h2>
            <span
              style={{
                padding: "2px 10px",
                background: "rgba(168,85,247,0.15)",
                border: "1px solid rgba(168,85,247,0.3)",
                borderRadius: "100px",
                color: "#A855F7",
                fontSize: "10px",
                fontWeight: "700",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.1em",
              }}
            >
              {profile ? "PERSONALIZED" : "GENERIC"}
            </span>
          </div>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>
            AI predicts what you'll do + one-click access to the right tools for each mission
          </p>
        </div>
      </div>
      
      {/* Workload Health */}
      <div
        className="mb-6 p-4 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${workload.healthColor}08 0%, transparent 100%)`,
          border: `1px solid ${workload.healthColor}30`,
          borderRadius: "12px",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: workload.healthColor, boxShadow: `0 0 8px ${workload.healthColor}` }}
          />
          <div>
            <div
              style={{
                color: workload.healthColor,
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.15em",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "2px",
              }}
            >
              WORKLOAD HEALTH: {workload.healthStatus}
            </div>
            <div style={{ color: "#A3A3A3", fontSize: "12px" }}>
              {workload.healthMessage}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: workload.healthColor, fontSize: "24px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
            {workload.completionRate}%
          </div>
          <div style={{ color: "#6B7280", fontSize: "10px", letterSpacing: "0.1em" }}>
            EXPECTED
          </div>
        </div>
      </div>
      
      {/* SLOTS */}
      <div className="space-y-6">
        {/* SLOT 1: Likely Complete */}
        {slots.likely_complete.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} color="#10B981" />
              <h3
                style={{
                  color: "#10B981",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                LIKELY TO COMPLETE — {slots.likely_complete.length} MISSION{slots.likely_complete.length > 1 ? "S" : ""}
              </h3>
            </div>
            {slots.likely_complete.map((task) => (
              <SlotTask
                key={task.id}
                task={task}
                slotType="likely_complete"
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {/* SLOT 2: Uncertain */}
        {slots.uncertain.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} color="#FCD34D" />
              <h3
                style={{
                  color: "#FCD34D",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                UNCERTAIN ZONE — {slots.uncertain.length} MISSION{slots.uncertain.length > 1 ? "S" : ""}
              </h3>
            </div>
            {slots.uncertain.map((task) => (
              <SlotTask
                key={task.id}
                task={task}
                slotType="uncertain"
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {/* SLOT 3: Likely Skip */}
        {slots.likely_skip.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={14} color="#EF4444" />
              <h3
                style={{
                  color: "#EF4444",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                AT RISK OF SKIPPING — {slots.likely_skip.length} MISSION{slots.likely_skip.length > 1 ? "S" : ""}
              </h3>
            </div>
            {slots.likely_skip.map((task) => (
              <SlotTask
                key={task.id}
                task={task}
                slotType="likely_skip"
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer Note */}
      {!profile && (
        <div
          className="mt-6 p-3 text-center"
          style={{
            background: "rgba(168,85,247,0.05)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#A855F7", fontSize: "12px" }}>
            <Brain size={12} className="inline mr-2" />
            Take the Big Five test for personalized predictions tuned to YOU
          </p>
        </div>
      )}
    </div>
  );
}