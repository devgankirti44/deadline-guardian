"use client";
import {
  Mail, CreditCard, Video, BookOpen, Code, Heart,
  Calendar, ShoppingCart, Phone, Globe, ExternalLink,
  Play, FileText, Users, Briefcase, GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";

// Smart action mapping based on task category + keywords
const getSmartActions = (task) => {
  const title = (task.title || "").toLowerCase();
  const desc = (task.description || "").toLowerCase();
  const category = (task.category || "").toLowerCase();
  const combined = `${title} ${desc} ${category}`;
  
  const actions = [];

  // ─── EMAIL / COMMUNICATION ───
  if (combined.match(/email|mail|send|reply|respond|draft|message|letter/)) {
    actions.push({
      id: "gmail",
      label: "Open Gmail",
      sublabel: "Draft or send email",
      icon: Mail,
      color: "#EA4335",
      url: "https://mail.google.com",
      type: "link",
    });
  }

  // ─── BILL PAYMENT / FINANCE ───
  if (combined.match(/bill|payment|pay|electricity|rent|utility|invoice|upi|transfer|bank/)) {
    actions.push({
      id: "gpay",
      label: "Open Google Pay",
      sublabel: "Make payment via UPI",
      icon: CreditCard,
      color: "#4285F4",
      url: "https://pay.google.com",
      type: "link",
    });
    actions.push({
      id: "paytm",
      label: "Open Paytm",
      sublabel: "Pay bills online",
      icon: CreditCard,
      color: "#00B9F5",
      url: "https://paytm.com",
      type: "link",
    });
  }

  // ─── MEETING / VIDEO CALL ───
  if (combined.match(/meet|meeting|call|zoom|video|conference|sync|standup|huddle/)) {
    actions.push({
      id: "gmeet",
      label: "Start Google Meet",
      sublabel: "Create or join video call",
      icon: Video,
      color: "#00897B",
      url: "https://meet.google.com/new",
      type: "link",
    });
    actions.push({
      id: "zoom",
      label: "Open Zoom",
      sublabel: "Join or create meeting",
      icon: Video,
      color: "#2D8CFF",
      url: "https://zoom.us/join",
      type: "link",
    });
    actions.push({
      id: "gcal",
      label: "Check Calendar",
      sublabel: "Verify meeting time",
      icon: Calendar,
      color: "#4285F4",
      url: "https://calendar.google.com",
      type: "link",
    });
  }

  // ─── LEARNING / COURSE ───
  if (combined.match(/course|learn|study|tutorial|lecture|video|udemy|coursera|node|react|python|javascript|assignment|homework/)) {
    actions.push({
      id: "youtube",
      label: "Open YouTube",
      sublabel: "Watch tutorial videos",
      icon: Play,
      color: "#FF0000",
      url: "https://youtube.com",
      type: "link",
    });
    actions.push({
      id: "udemy",
      label: "Open Udemy",
      sublabel: "Continue your course",
      icon: GraduationCap,
      color: "#A435F0",
      url: "https://udemy.com",
      type: "link",
    });
    actions.push({
      id: "coursera",
      label: "Open Coursera",
      sublabel: "Resume learning",
      icon: BookOpen,
      color: "#0056D2",
      url: "https://coursera.org",
      type: "link",
    });
  }

  // ─── CODING / PROJECT ───
  if (combined.match(/code|project|build|develop|program|github|deploy|bug|fix|feature|api|database|frontend|backend/)) {
    actions.push({
      id: "github",
      label: "Open GitHub",
      sublabel: "View repositories",
      icon: Code,
      color: "#FAFAFA",
      url: "https://github.com",
      type: "link",
    });
    actions.push({
      id: "vscode",
      label: "Open VS Code",
      sublabel: "Start coding",
      icon: Code,
      color: "#007ACC",
      url: "vscode://",
      type: "link",
    });
  }

  // ─── HEALTH / FITNESS ───
  if (combined.match(/gym|exercise|health|doctor|hospital|medicine|yoga|run|walk|workout|fitness/)) {
    actions.push({
      id: "health",
      label: "Open Google Fit",
      sublabel: "Track fitness",
      icon: Heart,
      color: "#4CAF50",
      url: "https://fit.google.com",
      type: "link",
    });
  }

  // ─── SHOPPING ───
  if (combined.match(/buy|purchase|order|shop|amazon|flipkart|grocery/)) {
    actions.push({
      id: "amazon",
      label: "Open Amazon",
      sublabel: "Shop online",
      icon: ShoppingCart,
      color: "#FF9900",
      url: "https://amazon.in",
      type: "link",
    });
  }

  // ─── DOCUMENT / WRITING ───
  if (combined.match(/write|document|report|essay|presentation|slides|spreadsheet|doc/)) {
    actions.push({
      id: "gdocs",
      label: "Open Google Docs",
      sublabel: "Start writing",
      icon: FileText,
      color: "#4285F4",
      url: "https://docs.google.com",
      type: "link",
    });
    actions.push({
      id: "gslides",
      label: "Open Google Slides",
      sublabel: "Create presentation",
      icon: FileText,
      color: "#F4B400",
      url: "https://slides.google.com",
      type: "link",
    });
  }

  // ─── PHONE CALL ───
  if (combined.match(/call|phone|ring|contact|speak to|talk to/)) {
    actions.push({
      id: "phone",
      label: "Open Phone",
      sublabel: "Make a call",
      icon: Phone,
      color: "#10B981",
      url: "tel:",
      type: "link",
    });
  }

  // ─── INTERVIEW ───
  if (combined.match(/interview|preparation|resume|cv|portfolio|job|apply/)) {
    actions.push({
      id: "linkedin",
      label: "Open LinkedIn",
      sublabel: "Review profile",
      icon: Users,
      color: "#0A66C2",
      url: "https://linkedin.com",
      type: "link",
    });
    actions.push({
      id: "leetcode",
      label: "Open LeetCode",
      sublabel: "Practice coding",
      icon: Code,
      color: "#FFA116",
      url: "https://leetcode.com",
      type: "link",
    });
  }

  // Always add Google Calendar as option
  if (!actions.find(a => a.id === "gcal")) {
    actions.push({
      id: "gcal",
      label: "Add to Calendar",
      sublabel: "Block time for this task",
      icon: Calendar,
      color: "#4285F4",
      url: task.deadline
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${new Date(task.deadline).toISOString().replace(/[-:]/g, '').replace('.000', '')}`
        : "https://calendar.google.com",
      type: "link",
    });
  }

  // Always add Google Search
  actions.push({
    id: "search",
    label: "Search Resources",
    sublabel: `Google "${task.title}"`,
    icon: Globe,
    color: "#4285F4",
    url: `https://google.com/search?q=${encodeURIComponent(task.title)}`,
    type: "link",
  });

  return actions.slice(0, 4); // Max 4 actions
};

export default function SmartActions({ task }) {
  const actions = getSmartActions(task);

  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => {
              window.open(action.url, "_blank");
              toast.success(`Opening ${action.label}...`);
            }}
            className="flex items-center gap-2 transition-all group"
            style={{
              padding: "6px 12px",
              background: `${action.color}10`,
              border: `1px solid ${action.color}30`,
              borderRadius: "8px",
              cursor: "pointer",
              color: action.color,
              fontSize: "11px",
              fontWeight: "600",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${action.color}20`;
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${action.color}10`;
              e.currentTarget.style.borderColor = `${action.color}30`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title={action.sublabel}
          >
            <Icon size={12} />
            {action.label}
            <ExternalLink size={8} style={{ opacity: 0.5 }} />
          </button>
        );
      })}
    </div>
  );
}