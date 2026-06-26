"use client";
import { useState, useEffect } from "react";
import { Brain, ArrowRight, ArrowLeft, Sparkles, Check, Award } from "lucide-react";
import toast from "react-hot-toast";

// SCIENTIFIC BIG FIVE PERSONALITY ASSESSMENT
// Based on 50-item IPIP (International Personality Item Pool)
// We use 15 most relevant items for productivity prediction

const QUESTIONS = [
  // ─── CONSCIENTIOUSNESS (5 items) — Most important for productivity ───
  {
    id: "c1",
    trait: "conscientiousness",
    reverse: false,
    question: "I get chores done right away.",
    icon: "✅",
  },
  {
    id: "c2",
    trait: "conscientiousness",
    reverse: true, // High score = LOW conscientiousness
    question: "I often forget to put things back in their proper place.",
    icon: "🗂️",
  },
  {
    id: "c3",
    trait: "conscientiousness",
    reverse: false,
    question: "I like to follow a schedule.",
    icon: "📅",
  },
  {
    id: "c4",
    trait: "conscientiousness",
    reverse: true,
    question: "I leave my belongings around.",
    icon: "📦",
  },
  {
    id: "c5",
    trait: "conscientiousness",
    reverse: false,
    question: "I finish what I start.",
    icon: "🏁",
  },

  // ─── NEUROTICISM (3 items) — Stress response, important for crisis mode ───
  {
    id: "n1",
    trait: "neuroticism",
    reverse: false,
    question: "I get stressed out easily.",
    icon: "😰",
  },
  {
    id: "n2",
    trait: "neuroticism",
    reverse: true,
    question: "I am relaxed most of the time.",
    icon: "😌",
  },
  {
    id: "n3",
    trait: "neuroticism",
    reverse: false,
    question: "I worry about things.",
    icon: "💭",
  },

  // ─── OPENNESS (3 items) — Adaptability ───
  {
    id: "o1",
    trait: "openness",
    reverse: false,
    question: "I have a vivid imagination.",
    icon: "💡",
  },
  {
    id: "o2",
    trait: "openness",
    reverse: false,
    question: "I am interested in abstract ideas.",
    icon: "🔬",
  },
  {
    id: "o3",
    trait: "openness",
    reverse: true,
    question: "I avoid trying new things.",
    icon: "🆕",
  },

  // ─── EXTRAVERSION (2 items) ───
  {
    id: "e1",
    trait: "extraversion",
    reverse: false,
    question: "I feel comfortable around people.",
    icon: "👥",
  },
  {
    id: "e2",
    trait: "extraversion",
    reverse: true,
    question: "I prefer to work alone.",
    icon: "🧘",
  },

  // ─── AGREEABLENESS (2 items) ───
  {
    id: "a1",
    trait: "agreeableness",
    reverse: false,
    question: "I sympathize with others' feelings.",
    icon: "❤️",
  },
  {
    id: "a2",
    trait: "agreeableness",
    reverse: true,
    question: "I am not interested in other people's problems.",
    icon: "🤷",
  },
];

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Disagree", short: "SD" },
  { value: 2, label: "Disagree", short: "D" },
  { value: 3, label: "Neutral", short: "N" },
  { value: 4, label: "Agree", short: "A" },
  { value: 5, label: "Strongly Agree", short: "SA" },
];

const calculateBigFive = (answers) => {
  // Calculate raw scores for each trait
  const traits = {
    conscientiousness: [],
    neuroticism: [],
    openness: [],
    extraversion: [],
    agreeableness: [],
  };

  QUESTIONS.forEach((q) => {
    const answer = answers[q.id];
    if (!answer) return;
    
    // Reverse-score items where needed
    const score = q.reverse ? 6 - answer : answer;
    traits[q.trait].push(score);
  });

  // Convert to 0-100 percentile
  const scores = {};
  Object.entries(traits).forEach(([trait, values]) => {
    if (values.length === 0) {
      scores[trait] = 50;
      return;
    }
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    // Convert 1-5 scale to 0-100
    scores[trait] = Math.round(((avg - 1) / 4) * 100);
  });

  // Determine dominant trait and productivity profile
  const conscientiousness = scores.conscientiousness;
  const neuroticism = scores.neuroticism;
  const openness = scores.openness;

  let profileType, profileColor, profileDescription, productivityStyle;

  if (conscientiousness >= 75) {
    profileType = "The Executor";
    profileColor = "#10B981";
    profileDescription = "High conscientiousness means you naturally finish what you start. AI will trust your time estimates and focus on workload optimization rather than accountability.";
    productivityStyle = "self_directed";
  } else if (conscientiousness >= 50 && neuroticism < 60) {
    profileType = "The Steady Builder";
    profileColor = "#34D399";
    profileDescription = "Balanced personality with moderate discipline. AI will provide gentle structure and prevent overcommitment.";
    productivityStyle = "balanced";
  } else if (conscientiousness >= 50 && neuroticism >= 60) {
    profileType = "The Pressure Performer";
    profileColor = "#F59E0B";
    profileDescription = "You're capable but stress-sensitive. AI will reduce friction during high-pressure moments and break tasks into calming micro-steps.";
    productivityStyle = "stress_managed";
  } else if (conscientiousness < 50 && neuroticism >= 60) {
    profileType = "The Vulnerable Strategist";
    profileColor = "#EF4444";
    profileDescription = "Lower discipline + high stress sensitivity. AI will intervene aggressively, use strong nudges, and protect you from overwhelm.";
    productivityStyle = "high_support";
  } else {
    profileType = "The Free Spirit";
    profileColor = "#A855F7";
    profileDescription = "Lower structure preference. AI will use flexible, creative approaches rather than rigid schedules.";
    productivityStyle = "flexible";
  }

  // Calculate AI calibration values
  const bufferMultiplier = 
    conscientiousness >= 75 ? 1.0 :
    conscientiousness >= 50 ? 1.3 :
    conscientiousness >= 30 ? 1.6 : 2.0;

  const procrastinationRisk =
    conscientiousness >= 70 ? "low" :
    conscientiousness >= 40 ? "medium" : "high";

  const stressResponse =
    neuroticism >= 70 ? "high_anxiety" :
    neuroticism >= 40 ? "moderate" : "calm";

  const interventionStyle =
    neuroticism >= 60 && conscientiousness < 50 ? "gentle_supportive" :
    conscientiousness >= 70 ? "minimal" :
    "balanced_firm";

  return {
    scores,
    profileType,
    profileColor,
    profileDescription,
    productivityStyle,
    bufferMultiplier,
    procrastinationRisk,
    stressResponse,
    interventionStyle,
    answers,
    completedAt: new Date().toISOString(),
  };
};

const TraitBar = ({ trait, score, color, description }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <span style={{ color: "#E5E5E5", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>
          {trait}
        </span>
        <span style={{ color: "#6B7280", fontSize: "10px" }}>
          {description}
        </span>
      </div>
      <span style={{ color: color, fontSize: "13px", fontFamily: "JetBrains Mono, monospace", fontWeight: "700" }}>
        {score}
      </span>
    </div>
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
      <div
        style={{
          width: `${score}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: "100px",
          transition: "width 1s ease",
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
    </div>
  </div>
);

export default function PersonalityProfiler({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState(null);

  const currentQuestion = QUESTIONS[step];
  const isLastQuestion = step === QUESTIONS.length - 1;
  const totalQuestions = QUESTIONS.length;

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLastQuestion) {
        const calculatedProfile = calculateBigFive(newAnswers);
        setProfile(calculatedProfile);
        setShowResults(true);
      } else {
        setStep(step + 1);
      }
    }, 250);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
const handleFinish = () => {
  localStorage.setItem("user_profile", JSON.stringify(profile));
  localStorage.setItem("profile_completed", "true");
  
  // Notify sidebar to update
  window.dispatchEvent(new CustomEvent("profile-updated"));
  
  toast.success(`Profile activated: ${profile.profileType}`, {
    duration: 4000,
    icon: "🧠",
  });
  onComplete(profile);
};
 
  // ─── RESULTS SCREEN ──────────────────────────
  if (showResults && profile) {
    const traitDescriptions = {
      openness: "Creativity, curiosity",
      conscientiousness: "Discipline, organization",
      extraversion: "Sociability, energy",
      agreeableness: "Cooperation, empathy",
      neuroticism: "Stress sensitivity",
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-8 overflow-y-auto"
        style={{
          background: "rgba(0,0,0,0.97)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="w-full max-w-3xl py-12">
          {/* Profile Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="relative"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${profile.profileColor}40 0%, transparent 70%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="absolute inset-0 animate-ping"
                style={{
                  borderRadius: "50%",
                  background: `${profile.profileColor}20`,
                  animationDuration: "2s",
                }}
              />
              <Brain
                size={48}
                color={profile.profileColor}
                style={{ filter: `drop-shadow(0 0 20px ${profile.profileColor})` }}
              />
            </div>
          </div>

          {/* Profile Header */}
          <div className="text-center mb-8">
            <div
              style={{
                color: profile.profileColor,
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.3em",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              BIG FIVE ASSESSMENT COMPLETE
            </div>

            <h1
              style={{
                fontSize: "42px",
                fontWeight: "700",
                color: "#FAFAFA",
                fontFamily: "Inter, sans-serif",
                letterSpacing: "-0.03em",
                lineHeight: "1.1",
                marginBottom: "8px",
              }}
            >
              You are <span style={{ color: profile.profileColor }}>{profile.profileType}</span>
            </h1>

            <p
              style={{
                color: "#A3A3A3",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Based on the OCEAN model — used by NASA, FBI, and Fortune 500 companies
            </p>
          </div>

          {/* Big Five Scores */}
          <div
            className="mb-6 p-6"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                color: "#F59E0B",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "16px",
              }}
            >
              OCEAN PROFILE
            </div>

            <TraitBar
              trait="Openness"
              score={profile.scores.openness}
              color="#A855F7"
              description={traitDescriptions.openness}
            />
            <TraitBar
              trait="Conscientiousness"
              score={profile.scores.conscientiousness}
              color="#10B981"
              description={traitDescriptions.conscientiousness}
            />
            <TraitBar
              trait="Extraversion"
              score={profile.scores.extraversion}
              color="#F59E0B"
              description={traitDescriptions.extraversion}
            />
            <TraitBar
              trait="Agreeableness"
              score={profile.scores.agreeableness}
              color="#34D399"
              description={traitDescriptions.agreeableness}
            />
            <TraitBar
              trait="Neuroticism"
              score={profile.scores.neuroticism}
              color="#EF4444"
              description={traitDescriptions.neuroticism}
            />
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "15px",
              color: "#A3A3A3",
              lineHeight: "1.6",
              maxWidth: "600px",
              margin: "0 auto 24px",
              textAlign: "center",
            }}
          >
            {profile.profileDescription}
          </p>

          {/* AI Calibration */}
          <div
            className="mb-8 p-5 max-w-2xl mx-auto"
            style={{
              background: `linear-gradient(135deg, ${profile.profileColor}10 0%, transparent 100%)`,
              borderRadius: "12px",
              border: `1px solid ${profile.profileColor}30`,
            }}
          >
            <div
              style={{
                color: profile.profileColor,
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "12px",
              }}
            >
              ⚡ AI CALIBRATION FOR YOU
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "4px" }}>
                  Time Estimate Buffer
                </div>
                <div style={{ color: "#FAFAFA", fontSize: "16px", fontWeight: "600", fontFamily: "JetBrains Mono, monospace" }}>
                  +{Math.round((profile.bufferMultiplier - 1) * 100)}%
                </div>
              </div>
              <div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "4px" }}>
                  Procrastination Risk
                </div>
                <div style={{
                  color: profile.procrastinationRisk === "high" ? "#EF4444"
                    : profile.procrastinationRisk === "medium" ? "#F59E0B" : "#10B981",
                  fontSize: "16px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                  {profile.procrastinationRisk}
                </div>
              </div>
              <div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "4px" }}>
                  Stress Response
                </div>
                <div style={{ color: "#FAFAFA", fontSize: "16px", fontWeight: "600", fontFamily: "JetBrains Mono, monospace" }}>
                  {profile.stressResponse.replace(/_/g, " ").toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginBottom: "4px" }}>
                  Intervention Style
                </div>
                <div style={{ color: "#FAFAFA", fontSize: "16px", fontWeight: "600", fontFamily: "JetBrains Mono, monospace" }}>
                  {profile.interventionStyle.replace(/_/g, " ").toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Enter Button */}
          <div className="text-center">
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-3"
              style={{
                padding: "16px 40px",
                background: profile.profileColor,
                border: "none",
                borderRadius: "100px",
                color: "#0D0D0D",
                fontSize: "14px",
                fontWeight: "700",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.1em",
                cursor: "pointer",
                boxShadow: `0 4px 30px ${profile.profileColor}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 40px ${profile.profileColor}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 30px ${profile.profileColor}40`;
              }}
            >
              ACTIVATE PERSONALIZED AI
              <ArrowRight size={16} />
            </button>

            <p
              style={{
                color: "#4B5563",
                fontSize: "11px",
                marginTop: "16px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              All 8 AI agents now calibrated to your psychology
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTION SCREEN ──────────────────────────
  const traitColors = {
    conscientiousness: "#10B981",
    neuroticism: "#EF4444",
    openness: "#A855F7",
    extraversion: "#F59E0B",
    agreeableness: "#34D399",
  };

  const currentColor = traitColors[currentQuestion.trait];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{
        background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? "24px" : "6px",
              height: "6px",
              borderRadius: "100px",
              background: i <= step ? "#F59E0B" : "rgba(255,255,255,0.1)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Step counter */}
      <div
        className="absolute top-8 left-8"
        style={{
          color: "#6B7280",
          fontSize: "11px",
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.2em",
        }}
      >
        BIG FIVE · {String(step + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
      </div>

      {/* Trait badge */}
      <div
        className="absolute top-8 right-8"
        style={{
          padding: "6px 14px",
          background: `${currentColor}15`,
          border: `1px solid ${currentColor}40`,
          borderRadius: "100px",
          color: currentColor,
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.15em",
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
        }}
      >
        {currentQuestion.trait}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={handleBack}
          className="absolute bottom-8 left-8 flex items-center gap-2 transition-colors"
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            color: "#6B7280",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={12} />
          Back
        </button>
      )}

      {/* Question */}
      <div className="w-full max-w-2xl">
        {/* Icon */}
        <div className="text-center mb-6" style={{ fontSize: "48px" }}>
          {currentQuestion.icon}
        </div>

        {/* Subtitle */}
        <div
          className="text-center mb-3"
          style={{
            color: "#6B7280",
            fontSize: "11px",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.2em",
          }}
        >
          RATE YOUR AGREEMENT
        </div>

        {/* Question */}
        <h1
          className="text-center mb-12"
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#FAFAFA",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: "1.3",
          }}
        >
          "{currentQuestion.question}"
        </h1>

        {/* Likert Scale */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {LIKERT_OPTIONS.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="flex flex-col items-center gap-2 transition-all group"
                style={{
                  padding: "20px 16px",
                  background: isSelected
                    ? `${currentColor}20`
                    : "rgba(255,255,255,0.02)",
                  border: isSelected
                    ? `2px solid ${currentColor}`
                    : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = `${currentColor}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  }
                }}
              >
                <div
                  style={{
                    color: isSelected ? currentColor : "#6B7280",
                    fontSize: "18px",
                    fontWeight: "700",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {option.short}
                </div>
                <div
                  style={{
                    color: isSelected ? "#FAFAFA" : "#A3A3A3",
                    fontSize: "10px",
                    fontWeight: isSelected ? "600" : "400",
                    lineHeight: "1.2",
                    textAlign: "center",
                  }}
                >
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Helper */}
        <p
          className="text-center"
          style={{
            color: "#4B5563",
            fontSize: "12px",
          }}
        >
          Be honest. The Big Five model (OCEAN) is used by psychologists worldwide to predict behavior.
        </p>
      </div>
    </div>
  );
}