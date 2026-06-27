"use client";
import { useState, useEffect } from "react";
import {
  Brain, X, ArrowRight, ArrowLeft, Sparkles, AlertTriangle, Target,
} from "lucide-react";
import { useMissionIntelligence } from "@/hooks/useMissionIntelligence";
import toast from "react-hot-toast";

export default function MissionAnalyzer({
  userId,
  initialTitle = "",
  initialDescription = "",
  onComplete,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [answers, setAnswers] = useState({});
  const [selectedDays, setSelectedDays] = useState(14);
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(3);

  const {
    analyzing,
    taskType,
    questions,
    effortEstimate,
    feasibility,
    deadlineSimulation,
    analyzeTaskType,
    estimateMissionEffort,
    checkFeasibility,
    simulateScenarios,
  } = useMissionIntelligence(userId);

  useEffect(() => {
    if (initialTitle) analyzeTaskType(initialTitle, initialDescription);
    // eslint-disable-next-line
  }, []);

  const handleAnswersSubmit = async () => {
    await estimateMissionEffort({ title, description, taskType, ...answers });
    setStep(2);
  };

  const handleEffortAccept = async () => {
    if (!effortEstimate) return;
    await checkFeasibility(
      { title, totalHours: effortEstimate.totalHours, taskType, ...answers },
      availableHoursPerDay,
      selectedDays,
      0
    );
    setStep(3);
  };

  const handleFeasibilityNext = async () => {
    if (!effortEstimate) return;
    await simulateScenarios(
      { title, totalHours: effortEstimate.totalHours, taskType },
      effortEstimate.totalHours,
      availableHoursPerDay
    );
    setStep(4);
  };

  const handleSimulationDone = () => setStep(5);

  const getCategoryFromType = (type) => {
    const map = {
      course: "Learning",
      assignment: "Assignment",
      interview_prep: "Learning",
      coding_project: "Project",
      exam_prep: "Learning",
      work_task: "Work",
      personal: "Personal",
    };
    return map[type] || "Other";
  };

  const handleCreateMission = () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + selectedDays);
    deadline.setHours(18, 0, 0, 0);

    const enhancedTask = {
      title,
      description,
      deadline: deadline.toISOString(),
      estimatedHours: effortEstimate?.totalHours || 2,
      priority:
        feasibility?.verdict === "UNREALISTIC" ? "critical" :
        feasibility?.verdict === "RISKY" ? "high" : "medium",
      category: getCategoryFromType(taskType),
      intelligence: {
        taskType,
        effortBreakdown: effortEstimate?.breakdown,
        feasibility: feasibility?.verdict,
        successProbability: feasibility?.successProbability,
        realityScore: feasibility?.realityScore,
        warnings: feasibility?.warnings,
      },
    };

    onComplete(enhancedTask);
  };

  const updateAnswer = (field, value) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const verdictColor =
    feasibility?.verdict === "REALISTIC" ? "#10B981" :
    feasibility?.verdict === "CHALLENGING" ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(135deg, #0D0D0D 0%, #0A0A0A 100%)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "16px",
          boxShadow: "0 0 60px rgba(168,85,247,0.2)",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 10 }}>
              <Brain size={20} color="#A855F7" />
            </div>
            <div>
              <div style={{ color: "#A855F7", fontSize: 10, letterSpacing: "0.2em", fontWeight: 700 }}>
                MISSION INTELLIGENCE ENGINE
              </div>
              <h2 style={{ color: "#FAFAFA", fontSize: 20, fontWeight: 600, marginTop: 4 }}>
                {step === 1 && "Tell me about your mission"}
                {step === 2 && "Effort analysis complete"}
                {step === 3 && "Feasibility check"}
                {step === 4 && "What-if simulator"}
                {step === 5 && "Mission briefing ready"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "#6B7280", cursor: "pointer", background: "transparent", border: "none" }}>
            <X size={20} />
          </button>
        </div>

        {/* PROGRESS */}
        <div className="flex gap-1 px-6 py-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{ flex: 1, height: 3, background: s <= step ? "#A855F7" : "rgba(255,255,255,0.05)", borderRadius: 100, transition: "all 0.3s" }} />
          ))}
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label style={{ color: "#A3A3A3", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Mission Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Node.js course"
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FAFAFA", fontSize: 14, outline: "none" }}
                />
              </div>

              {title && title !== initialTitle && (
                <button
                  onClick={() => analyzeTaskType(title, description)}
                  disabled={analyzing}
                  style={{ padding: "8px 14px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer" }}
                >
                  {analyzing ? "Analyzing..." : "🔍 Re-analyze this task"}
                </button>
              )}

              {taskType && (
                <div className="p-4" style={{ background: "rgba(168,85,247,0.05)", borderLeft: "2px solid #A855F7", borderRadius: 8 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} color="#A855F7" />
                    <span style={{ color: "#A855F7", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em" }}>
                      AI DETECTED TASK TYPE
                    </span>
                  </div>
                  <p style={{ color: "#FAFAFA", fontSize: 14 }}>
                    This is a <strong style={{ color: "#A855F7" }}>{taskType.replace("_", " ").toUpperCase()}</strong> task
                  </p>
                </div>
              )}

              {questions.length > 0 && (
                <div>
                  <h3 style={{ color: "#FAFAFA", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                    Help me understand your mission better:
                  </h3>
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id}>
                        <label style={{ color: "#A3A3A3", fontSize: 13, display: "block", marginBottom: 6 }}>
                          {q.question}
                        </label>
                        {q.type === "select" ? (
                          <select
                            value={answers[q.field] || ""}
                            onChange={(e) => updateAnswer(q.field, e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FAFAFA", fontSize: 13, outline: "none" }}
                          >
                            <option value="">Select...</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={q.type === "number" ? "number" : "text"}
                            value={answers[q.field] || ""}
                            onChange={(e) => updateAnswer(q.field, e.target.value)}
                            placeholder={q.type === "number" ? "Enter a number" : "Your answer..."}
                            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FAFAFA", fontSize: 13, outline: "none" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A3A3A3", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  onClick={handleAnswersSubmit}
                  disabled={!title || analyzing || questions.length === 0}
                  style={{ padding: "10px 24px", background: "#A855F7", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: !title || analyzing ? "wait" : "pointer", opacity: !title || analyzing ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {analyzing ? "Analyzing..." : "Estimate Effort"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && effortEstimate && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div style={{ color: "#A855F7", fontSize: 12, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 8 }}>
                  ESTIMATED EFFORT
                </div>
                <div style={{ color: "#FAFAFA", fontSize: 64, fontWeight: 700, lineHeight: 1 }}>
                  {effortEstimate.totalHours}
                </div>
                <div style={{ color: "#A3A3A3", fontSize: 14, marginTop: 4 }}>hours of work</div>
              </div>

              {effortEstimate.breakdown && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(effortEstimate.breakdown).map(([key, value]) => (
                    <div key={key} style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                      <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{key}</div>
                      <div style={{ color: "#FAFAFA", fontSize: 24, fontWeight: 600 }}>{value}h</div>
                    </div>
                  ))}
                </div>
              )}

              {effortEstimate.reasoning && (
                <div style={{ background: "rgba(168,85,247,0.05)", padding: 16, borderRadius: 8, borderLeft: "2px solid #A855F7" }}>
                  <p style={{ color: "#D4D4D4", fontSize: 13, lineHeight: 1.6 }}>{effortEstimate.reasoning}</p>
                </div>
              )}

              {effortEstimate.warning && (
                <div className="flex items-start gap-3" style={{ background: "rgba(245,158,11,0.08)", padding: "12px 16px", borderRadius: 8 }}>
                  <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ color: "#FCD34D", fontSize: 12 }}>{effortEstimate.warning}</p>
                </div>
              )}

              <div>
                <label style={{ color: "#A3A3A3", fontSize: 13, display: "block", marginBottom: 8 }}>
                  How many days do you have? <span style={{ color: "#A855F7" }}>{selectedDays} days</span>
                </label>
                <input type="range" min="1" max="60" value={selectedDays} onChange={(e) => setSelectedDays(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#A855F7" }} />
              </div>

              <div>
                <label style={{ color: "#A3A3A3", fontSize: 13, display: "block", marginBottom: 8 }}>
                  Available hours per day: <span style={{ color: "#A855F7" }}>{availableHoursPerDay}h/day</span>
                </label>
                <input type="range" min="0.5" max="12" step="0.5" value={availableHoursPerDay} onChange={(e) => setAvailableHoursPerDay(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#A855F7" }} />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A3A3A3", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleEffortAccept} disabled={analyzing} style={{ padding: "10px 24px", background: "#A855F7", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: analyzing ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {analyzing ? "Checking..." : "Check Feasibility"} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && feasibility && (
            <div className="space-y-5">
              <div className="text-center py-6" style={{ background: `${verdictColor}15`, borderRadius: 12, borderLeft: `3px solid ${verdictColor}` }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 8, color: "#6B7280" }}>VERDICT</div>
                <div style={{ color: verdictColor, fontSize: 32, fontWeight: 700 }}>{feasibility.verdict}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center" style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Success Probability</div>
                  <div style={{ color: feasibility.successProbability > 70 ? "#10B981" : feasibility.successProbability > 40 ? "#F59E0B" : "#EF4444", fontSize: 28, fontWeight: 700 }}>{feasibility.successProbability}%</div>
                </div>
                <div className="text-center" style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Reality Score</div>
                  <div style={{ color: feasibility.realityScore > 70 ? "#10B981" : feasibility.realityScore > 40 ? "#F59E0B" : "#EF4444", fontSize: 28, fontWeight: 700 }}>{feasibility.realityScore}%</div>
                </div>
                <div className="text-center" style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Required/Day</div>
                  <div style={{ color: "#A855F7", fontSize: 28, fontWeight: 700 }}>{feasibility.requiredHoursPerDay}h</div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                <p style={{ color: "#D4D4D4", fontSize: 13, lineHeight: 1.6 }}>{feasibility.reasoning}</p>
              </div>

              {feasibility.warnings?.length > 0 && (
                <div style={{ background: "rgba(245,158,11,0.05)", padding: 16, borderRadius: 8, borderLeft: "2px solid #F59E0B" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} color="#F59E0B" />
                    <span style={{ color: "#F59E0B", fontSize: 11, letterSpacing: "0.15em", fontWeight: 700 }}>WARNINGS</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {feasibility.warnings.map((w, i) => (
                      <li key={i} style={{ color: "#FCD34D", fontSize: 13, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0 }}>⚠️</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feasibility.recommendations?.length > 0 && (
                <div style={{ background: "rgba(16,185,129,0.05)", padding: 16, borderRadius: 8, borderLeft: "2px solid #10B981" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} color="#10B981" />
                    <span style={{ color: "#10B981", fontSize: 11, letterSpacing: "0.15em", fontWeight: 700 }}>RECOMMENDATIONS</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {feasibility.recommendations.map((r, i) => (
                      <li key={i} style={{ color: "#6EE7B7", fontSize: 13, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0 }}>💡</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A3A3A3", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ArrowLeft size={14} /> Adjust
                </button>
                <button onClick={handleFeasibilityNext} disabled={analyzing} style={{ padding: "10px 24px", background: "#A855F7", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: analyzing ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {analyzing ? "Simulating..." : "What-If Simulator"} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && deadlineSimulation && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <p style={{ color: "#A3A3A3", fontSize: 13 }}>See how different deadlines impact your success</p>
              </div>

              <div className="space-y-3">
                {deadlineSimulation.scenarios?.map((scenario, i) => {
                  const isRecommended = deadlineSimulation.recommendedDays === scenario.days;
                  return (
                    <div key={i} style={{ background: isRecommended ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.03)", border: isRecommended ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent", padding: 16, borderRadius: 8 }}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div style={{ color: "#FAFAFA", fontSize: 18, fontWeight: 600 }}>
                            {scenario.days} days
                            {isRecommended && (
                              <span style={{ marginLeft: 10, padding: "2px 8px", background: "rgba(16,185,129,0.2)", color: "#10B981", fontSize: 10, borderRadius: 4, fontWeight: 700 }}>
                                AI RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div style={{ color: "#A3A3A3", fontSize: 12, marginTop: 4 }}>{scenario.hoursPerDay} hours/day</div>
                        </div>
                        <div className="text-right">
                          <div style={{ color: scenario.successProbability > 70 ? "#10B981" : scenario.successProbability > 40 ? "#F59E0B" : "#EF4444", fontSize: 24, fontWeight: 700 }}>
                            {scenario.successProbability}%
                          </div>
                          <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em" }}>{scenario.stressLevel}</div>
                        </div>
                      </div>
                      <div style={{ color: "#D4D4D4", fontSize: 12 }}>{scenario.tradeoffs}</div>
                      <button
                        onClick={() => { setSelectedDays(scenario.days); handleSimulationDone(); }}
                        style={{ marginTop: 10, padding: "6px 12px", background: "transparent", border: `1px solid ${isRecommended ? "#10B981" : "rgba(168,85,247,0.4)"}`, borderRadius: 6, color: isRecommended ? "#10B981" : "#A855F7", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                      >
                        Use this deadline ({scenario.days} days)
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A3A3A3", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleSimulationDone} style={{ padding: "10px 24px", background: "#A855F7", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Continue with {selectedDays} days <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center mb-4" style={{ width: 80, height: 80, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20 }}>
                  <Target size={36} color="#10B981" />
                </div>
                <h3 style={{ color: "#FAFAFA", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Mission Briefing Ready</h3>
                <p style={{ color: "#A3A3A3", fontSize: 14 }}>AI has analyzed your mission. Review and deploy.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Mission</div>
                  <div style={{ color: "#FAFAFA", fontSize: 14, fontWeight: 600 }}>{title}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Total Effort</div>
                  <div style={{ color: "#A855F7", fontSize: 14, fontWeight: 600 }}>{effortEstimate?.totalHours} hours</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Deadline</div>
                  <div style={{ color: "#FAFAFA", fontSize: 14, fontWeight: 600 }}>{selectedDays} days from now</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Success Rate</div>
                  <div style={{ color: feasibility?.successProbability > 70 ? "#10B981" : "#F59E0B", fontSize: 14, fontWeight: 600 }}>{feasibility?.successProbability}%</div>
                </div>
              </div>

              <button
                onClick={handleCreateMission}
                style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #A855F7, #7C3AED)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em", boxShadow: "0 4px 20px rgba(168,85,247,0.3)", marginTop: 8 }}
              >
                🚀 DEPLOY MISSION WITH INTELLIGENCE
              </button>

              <button onClick={() => setStep(1)} style={{ width: "100%", padding: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A3A3A3", fontSize: 12, cursor: "pointer" }}>
                ← Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}