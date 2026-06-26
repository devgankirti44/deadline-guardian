"use client";
import { useState, useEffect } from "react";
import {
  Mail, X, Copy, Check, Sparkles, AlertCircle,
  Send, Clock, User, RefreshCw, ChevronRight,
} from "lucide-react";
import { runEmailDrafterAgent } from "@/lib/gemini";
import toast from "react-hot-toast";

const EMAIL_TYPES = [
  {
    id: "extension",
    label: "Request Extension",
    icon: "📅",
    color: "#F59E0B",
    description: "Ask for more time professionally",
    bestFor: "Before deadline passes",
  },
  {
    id: "apology",
    label: "Apology + Plan",
    icon: "🙏",
    color: "#EF4444",
    description: "Own the miss, propose recovery",
    bestFor: "After deadline missed",
  },
  {
    id: "update",
    label: "Status Update",
    icon: "📊",
    color: "#34D399",
    description: "Share progress and timeline",
    bestFor: "Mid-project check-in",
  },
  {
    id: "heads_up",
    label: "Quick Heads-Up",
    icon: "💬",
    color: "#A855F7",
    description: "Casual notification to teammate",
    bestFor: "Informal coordination",
  },
];

export default function EmailDrafter({ task, user, onClose }) {
  const [selectedType, setSelectedType] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedTone, setSelectedTone] = useState(0); // 0=Formal, 1=Balanced, 2=Casual

  const handleGenerate = async (type) => {
    setSelectedType(type);
    setLoading(true);
    setEmailData(null);
    
    toast.loading("AI drafting your email...", { id: "email" });

    try {
      const result = await runEmailDrafterAgent(task, type.id, {
        name: user?.displayName || "Your Name",
      });

      if (result && result.emails) {
        setEmailData(result);
        setSelectedTone(1); // Default to Balanced
        toast.success("Email drafts ready!", { id: "email" });
      } else {
        toast.error("Could not generate emails. API quota may be exceeded.", { id: "email" });
      }
    } catch (error) {
      toast.error("Generation failed", { id: "email" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!", { icon: "📋" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyFull = (email) => {
    const fullText = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Full email copied — paste into Gmail!", { 
      icon: "✅",
      duration: 3000,
    });
  };

  const handleOpenGmail = (email) => {
    const subject = encodeURIComponent(email.subject);
    const body = encodeURIComponent(email.body);
    window.open(`https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}`, "_blank");
    toast.success("Opening Gmail...");
  };

  const currentEmail = emailData?.emails?.[selectedTone];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl my-12"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "20px",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.1)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          className="px-8 py-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.1), transparent)",
            borderBottom: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(168,85,247,0.15)",
                border: "1px solid #A855F7",
                borderRadius: "12px",
              }}
            >
              <Mail size={22} color="#A855F7" />
            </div>
            <div>
              <div
                style={{
                  color: "#A855F7",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "4px",
                }}
              >
                AI EMAIL DRAFTER
              </div>
              <h2 style={{ color: "#FAFAFA", fontSize: "20px", fontWeight: "600" }}>
                Draft a professional email
              </h2>
              <p style={{ color: "#A3A3A3", fontSize: "13px", marginTop: "2px" }}>
                For: <span style={{ color: "#FCD34D" }}>{task.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "10px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              color: "#6B7280",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-8">
          {!emailData && !loading && (
            <>
              {/* EMAIL TYPE SELECTION */}
              <div className="mb-6">
                <p
                  style={{
                    color: "#A3A3A3",
                    fontSize: "14px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  Choose the type of email you need. AI will generate 3 tone variations.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {EMAIL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleGenerate(type)}
                      className="text-left transition-all group"
                      style={{
                        padding: "20px",
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${type.color}20`,
                        borderRadius: "12px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${type.color}08`;
                        e.currentTarget.style.borderColor = type.color;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = `${type.color}20`;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span style={{ fontSize: "28px" }}>{type.icon}</span>
                        <div className="flex-1">
                          <div
                            style={{
                              color: type.color,
                              fontSize: "10px",
                              fontWeight: "700",
                              letterSpacing: "0.15em",
                              fontFamily: "JetBrains Mono, monospace",
                              marginBottom: "6px",
                            }}
                          >
                            {type.label.toUpperCase()}
                          </div>
                          <p style={{ color: "#FAFAFA", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                            {type.description}
                          </p>
                          <p style={{ color: "#6B7280", fontSize: "12px" }}>
                            Best for: {type.bestFor}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          color: type.color,
                          fontSize: "11px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: "700",
                          letterSpacing: "0.1em",
                        }}
                      >
                        GENERATE NOW
                        <ChevronRight size={12} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="py-16 text-center">
              <div className="guardian-loader mx-auto mb-4" style={{ width: 48, height: 48 }} />
              <p
                style={{
                  color: "#A855F7",
                  fontSize: "14px",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                AI DRAFTING YOUR EMAIL...
              </p>
              <p style={{ color: "#6B7280", fontSize: "12px" }}>
                Generating 3 tone variations
              </p>
            </div>
          )}

          {/* EMAIL RESULTS */}
          {emailData && currentEmail && (
            <div>
              {/* TONE SELECTOR */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div
                      style={{
                        color: selectedType?.color || "#A855F7",
                        fontSize: "10px",
                        fontWeight: "700",
                        letterSpacing: "0.2em",
                        fontFamily: "JetBrains Mono, monospace",
                        marginBottom: "4px",
                      }}
                    >
                      {selectedType?.label.toUpperCase()} — 3 VARIATIONS
                    </div>
                    <p style={{ color: "#A3A3A3", fontSize: "13px" }}>
                      Choose the tone that fits your audience
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerate(selectedType)}
                    style={{
                      padding: "8px 14px",
                      background: "transparent",
                      border: "1px solid rgba(168,85,247,0.3)",
                      borderRadius: "100px",
                      color: "#A855F7",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2">
  <button
    onClick={() => {
      setEmailData(null);
      setSelectedType(null);
    }}
    style={{
      padding: "8px 14px",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "100px",
      color: "#6B7280",
      fontSize: "11px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
  >
    ← Back
  </button>

  <button
    onClick={() => handleGenerate(selectedType)}
    style={{
      padding: "8px 14px",
      background: "transparent",
      border: "1px solid rgba(168,85,247,0.3)",
      borderRadius: "100px",
      color: "#A855F7",
      fontSize: "11px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
  >
    <RefreshCw size={11} />
    Regenerate
  </button>
</div>

                <div className="flex gap-2">
                  {emailData.emails.map((email, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTone(i)}
                      className="flex-1 transition-all"
                      style={{
                        padding: "12px 16px",
                        background: selectedTone === i
                          ? "linear-gradient(135deg, rgba(168,85,247,0.15), transparent)"
                          : "rgba(255,255,255,0.02)",
                        border: selectedTone === i
                          ? "1px solid #A855F7"
                          : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          color: selectedTone === i ? "#A855F7" : "#A3A3A3",
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "0.1em",
                          fontFamily: "JetBrains Mono, monospace",
                          marginBottom: "4px",
                        }}
                      >
                        {email.tone.toUpperCase()}
                      </div>
                      <div style={{ color: "#6B7280", fontSize: "11px" }}>
                        {email.toneDescription}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* EMAIL PREVIEW */}
              <div
                className="mb-6"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                {/* Email Header Bar */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Mail size={12} color="#A855F7" />
                    <span
                      style={{
                        color: "#A855F7",
                        fontSize: "10px",
                        fontWeight: "700",
                        letterSpacing: "0.15em",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      EMAIL PREVIEW
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "#6B7280", fontSize: "11px" }}>
                      <Clock size={10} className="inline mr-1" />
                      {currentEmail.estimatedReadTime}
                    </span>
                    {emailData.suggestedRecipient && (
                      <span style={{ color: "#6B7280", fontSize: "11px" }}>
                        <User size={10} className="inline mr-1" />
                        To: {emailData.suggestedRecipient}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span
                    style={{
                      color: "#6B7280",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.1em",
                      minWidth: "70px",
                    }}
                  >
                    SUBJECT:
                  </span>
                  <span style={{ color: "#FAFAFA", fontSize: "14px", fontWeight: "500", flex: 1 }}>
                    {currentEmail.subject}
                  </span>
                  <button
                    onClick={() => handleCopy(currentEmail.subject, `subject-${selectedTone}`)}
                    style={{
                      padding: "6px",
                      background: "transparent",
                      border: "none",
                      color: copiedIndex === `subject-${selectedTone}` ? "#10B981" : "#6B7280",
                      cursor: "pointer",
                    }}
                  >
                    {copiedIndex === `subject-${selectedTone}` ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <pre
                    style={{
                      color: "#E5E5E5",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      fontFamily: "Inter, sans-serif",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      margin: 0,
                    }}
                  >
                    {currentEmail.body}
                  </pre>
                </div>

                {/* Use Case Hint */}
                {currentEmail.useCase && (
                  <div
                    className="px-5 py-3 flex items-start gap-2"
                    style={{
                      background: "rgba(168,85,247,0.04)",
                      borderTop: "1px solid rgba(168,85,247,0.1)",
                    }}
                  >
                    <Sparkles size={10} color="#A855F7" className="mt-0.5 flex-shrink-0" />
                    <span style={{ color: "#A855F7", fontSize: "11px", fontStyle: "italic" }}>
                      Best for: {currentEmail.useCase}
                    </span>
                  </div>
                )}
              </div>

              {/* WARNING (if any) */}
              {emailData.warning && (
                <div
                  className="mb-4 p-3 flex items-start gap-3"
                  style={{
                    background: "rgba(245,158,11,0.05)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: "8px",
                  }}
                >
                  <AlertCircle size={14} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
                  <p style={{ color: "#FCD34D", fontSize: "12px" }}>
                    <strong>AI Note:</strong> {emailData.warning}
                  </p>
                </div>
              )}

              {/* SUCCESS PROBABILITY */}
              {emailData.successProbability && (
                <div className="mb-6 text-center">
                  <p style={{ color: "#10B981", fontSize: "12px" }}>
                    <Sparkles size={11} className="inline mr-1" />
                    {emailData.successProbability}
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCopyFull(currentEmail)}
                  className="flex items-center justify-center gap-2 transition-all"
                  style={{
                    padding: "14px",
                    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                    fontFamily: "JetBrains Mono, monospace",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(168,85,247,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(168,85,247,0.3)";
                  }}
                >
                  <Copy size={14} />
                  COPY FULL EMAIL
                </button>

                <button
                  onClick={() => handleOpenGmail(currentEmail)}
                  className="flex items-center justify-center gap-2 transition-all"
                  style={{
                    padding: "14px",
                    background: "transparent",
                    color: "#A855F7",
                    border: "1px solid #A855F7",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                    fontFamily: "JetBrains Mono, monospace",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(168,85,247,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Send size={14} />
                  OPEN IN GMAIL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}