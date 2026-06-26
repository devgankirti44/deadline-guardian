"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { onAuthChange } from "@/lib/firebase";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useTasks } from "@/hooks/useTasks";
import ConnectCalendarButton from "@/components/calendar/ConnectCalendarButton";
import {
  Calendar, Clock, Users, MapPin, Video, RefreshCw,
  ExternalLink, AlertTriangle, ChevronRight, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CalendarPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => u && setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const calendar = params.get("calendar");
      if (calendar === "connected") {
        toast.success("🎉 Google Calendar connected!");
        window.history.replaceState({}, "", "/calendar");
      } else if (calendar === "denied") {
        toast.error("Calendar permission denied");
      } else if (calendar === "error") {
        toast.error("Connection failed. Try again.");
      }
    }
  }, []);

  const { tasks } = useTasks(user?.uid);
  const { isConnected, events, loading, fetchEvents, createEventFromTask } = useGoogleCalendar(user?.uid);

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.start).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const conflicts = tasks.filter(t => {
    if (t.completed || !t.deadline) return false;
    const taskTime = new Date(t.deadline).getTime();
    return events.some(e => {
      const eventStart = new Date(e.start).getTime();
      const eventEnd = new Date(e.end).getTime();
      return taskTime >= eventStart && taskTime <= eventEnd;
    });
  });

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <AppShell>
      <div className="min-h-full" style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)" }}>
        
        {/* HEADER */}
        <div className="px-12 pt-12 pb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4285F4" }} />
              <span style={{
                color: "#4285F4",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.25em",
                fontWeight: "500",
              }}>
                CALENDAR HUB
              </span>
            </div>
            <h1 style={{
              fontSize: "56px",
              fontWeight: "700",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
              color: "#FAFAFA",
              marginBottom: "12px",
            }}>
              Your <span style={{ color: "#4285F4" }}>schedule</span>, synced.
            </h1>
            <p style={{ color: "#A3A3A3", fontSize: "16px", maxWidth: "500px" }}>
              Real-time Google Calendar integration. See all events, detect conflicts, auto-sync tasks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <button
                onClick={() => fetchEvents(7)}
                disabled={loading}
                className="flex items-center gap-2 transition-all"
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#A3A3A3",
                  fontSize: "12px",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            )}
            <ConnectCalendarButton userId={user?.uid} />
          </div>
        </div>

        {/* NOT CONNECTED STATE */}
        {!isConnected && (
          <div className="px-12 pb-16">
            <div
              className="p-12 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(66,133,244,0.05) 0%, transparent 100%)",
                border: "1px solid rgba(66,133,244,0.2)",
                borderRadius: "16px",
              }}
            >
              <div
                className="inline-flex items-center justify-center mb-6"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(66,133,244,0.1)",
                  border: "1px solid rgba(66,133,244,0.3)",
                  borderRadius: "20px",
                }}
              >
                <Calendar size={36} color="#4285F4" />
              </div>
              <h2 style={{ color: "#FAFAFA", fontSize: "24px", fontWeight: "600", marginBottom: "12px" }}>
                Connect Google Calendar
              </h2>
              <p style={{ color: "#A3A3A3", fontSize: "14px", maxWidth: "500px", margin: "0 auto 24px" }}>
                Sync your real calendar events with Deadline Guardian. AI will detect conflicts and auto-schedule tasks.
              </p>
              <ConnectCalendarButton userId={user?.uid} />
              
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: Calendar, title: "Real Events", desc: "See your actual calendar" },
                  { icon: AlertTriangle, title: "Conflict Detection", desc: "AI warns of clashes" },
                  { icon: Sparkles, title: "Auto-Sync", desc: "Tasks → Calendar events" },
                ].map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px" }}>
                    <f.icon size={18} color="#4285F4" className="mb-2" />
                    <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{f.title}</div>
                    <div style={{ color: "#6B7280", fontSize: "11px" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONNECTED STATE */}
        {isConnected && (
          <>
            {conflicts.length > 0 && (
              <div className="px-12 pb-8">
                <div
                  className="p-5"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 100%)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} color="#EF4444" className="flex-shrink-0 mt-0.5" />
                    <div>
                      <div style={{ color: "#EF4444", fontSize: "12px", fontWeight: "700", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace", marginBottom: "6px" }}>
                        {conflicts.length} SCHEDULE CONFLICT{conflicts.length > 1 ? "S" : ""} DETECTED
                      </div>
                      <p style={{ color: "#A3A3A3", fontSize: "13px" }}>
                        Some task deadlines fall during your meetings. Review and reschedule.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-12 pb-8 grid grid-cols-3 gap-4">
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px" }}>
                <div style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", marginBottom: "8px" }}>UPCOMING EVENTS</div>
                <div style={{ color: "#4285F4", fontSize: "36px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>{events.length}</div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "4px" }}>Next 7 days</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px" }}>
                <div style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", marginBottom: "8px" }}>WITH VIDEO CALL</div>
                <div style={{ color: "#10B981", fontSize: "36px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>{events.filter(e => e.meetingLink).length}</div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "4px" }}>Google Meet ready</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px" }}>
                <div style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", marginBottom: "8px" }}>CONFLICTS</div>
                <div style={{ color: conflicts.length > 0 ? "#EF4444" : "#10B981", fontSize: "36px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>{conflicts.length}</div>
                <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "4px" }}>{conflicts.length === 0 ? "All clear" : "Need attention"}</div>
              </div>
            </div>

            <div className="px-12 pb-16">
              {loading && (
                <div className="text-center py-12">
                  <RefreshCw size={24} color="#4285F4" className="animate-spin mx-auto mb-3" />
                  <p style={{ color: "#A3A3A3", fontSize: "13px" }}>Loading your calendar...</p>
                </div>
              )}

              {!loading && events.length === 0 && (
                <div className="text-center py-16" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                  <Calendar size={32} color="#4B5563" className="mx-auto mb-3" />
                  <p style={{ color: "#A3A3A3", fontSize: "14px", marginBottom: "8px" }}>No upcoming events</p>
                  <p style={{ color: "#6B7280", fontSize: "12px" }}>Your calendar is clear for the next 7 days</p>
                </div>
              )}

              {!loading && Object.entries(groupedEvents).map(([date, dayEvents]) => (
                <div key={date} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 style={{
                      color: "#FAFAFA",
                      fontSize: "14px",
                      fontWeight: "600",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.15em",
                    }}>
                      {formatDate(dayEvents[0].start).toUpperCase()}
                    </h3>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                    <span style={{ color: "#6B7280", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                      {dayEvents.length} EVENT{dayEvents.length > 1 ? "S" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-5 transition-all"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "12px",
                          borderLeft: "2px solid #4285F4",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 style={{ color: "#FAFAFA", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-4 flex-wrap mb-3">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} color="#6B7280" />
                                <span style={{ color: "#A3A3A3", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                                  {event.isAllDay ? "All day" : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={12} color="#6B7280" />
                                  <span style={{ color: "#A3A3A3", fontSize: "12px" }}>{event.location}</span>
                                </div>
                              )}
                              {event.attendees.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Users size={12} color="#6B7280" />
                                  <span style={{ color: "#A3A3A3", fontSize: "12px" }}>
                                    {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <p style={{ color: "#6B7280", fontSize: "12px", lineHeight: "1.5", marginBottom: "12px" }}>
                                {event.description.substring(0, 150)}{event.description.length > 150 ? "..." : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 transition-all"
                              style={{
                                padding: "6px 12px",
                                background: "rgba(0,137,123,0.15)",
                                border: "1px solid rgba(0,137,123,0.3)",
                                borderRadius: "6px",
                                color: "#00897B",
                                fontSize: "11px",
                                fontWeight: "600",
                                textDecoration: "none",
                              }}
                            >
                              <Video size={12} />
                              Join Meeting
                            </a>
                          )}
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 transition-all"
                            style={{
                              padding: "6px 12px",
                              background: "rgba(66,133,244,0.1)",
                              border: "1px solid rgba(66,133,244,0.3)",
                              borderRadius: "6px",
                              color: "#4285F4",
                              fontSize: "11px",
                              fontWeight: "600",
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={12} />
                            Open in Google
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {tasks.filter(t => !t.completed && t.deadline).length > 0 && (
              <div className="px-12 pb-16">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} color="#F59E0B" />
                  <h3 style={{ color: "#FAFAFA", fontSize: "18px", fontWeight: "600" }}>
                    Auto-Sync Tasks to Calendar
                  </h3>
                </div>
                <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>
                  One-click: add any pending task as a Google Calendar event
                </p>
                
                <div className="space-y-2">
                  {tasks.filter(t => !t.completed && t.deadline).slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "10px",
                      }}
                    >
                      <div className="flex-1">
                        <div style={{ color: "#FAFAFA", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                          {task.title}
                        </div>
                        <div style={{ color: "#6B7280", fontSize: "11px" }}>
                          Deadline: {new Date(task.deadline).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => createEventFromTask(task)}
                        className="flex items-center gap-1.5"
                        style={{
                          padding: "8px 14px",
                          background: "rgba(66,133,244,0.1)",
                          border: "1px solid rgba(66,133,244,0.3)",
                          borderRadius: "6px",
                          color: "#4285F4",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        <Calendar size={12} />
                        Add to Calendar
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}