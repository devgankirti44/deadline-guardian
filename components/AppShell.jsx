"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/firebase";
import { MissionConsole } from "@/components/navigation/MissionConsole";
import { useTasks } from "@/hooks/useTasks";
import { useGuardianWatcher } from "@/hooks/useGuardianWatcher";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import NotificationPrompt from "@/components/notifications/NotificationPrompt";
import ProfilerWrapper from "@/components/profiler/ProfilerWrapper";
import VoiceControl from "@/components/voice/VoiceControl";

export default function AppShell({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
      } else {
        setUser(firebaseUser);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  const { tasks, loading: tasksLoading } = useTasks(user?.uid);
  
  // 📅 Google Calendar connection status (for nav indicator)
  const { isConnected: calendarConnected, events: calendarEvents } = useGoogleCalendar(user?.uid);

  // Guardian watcher (notifications only, no voice)
  useGuardianWatcher(tasks);

  useEffect(() => {
    if (user && !tasksLoading) {
      const timer = setTimeout(() => {
        setDataReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, tasksLoading, tasks]);

  const critical = tasks.filter((t) => !t.completed && t.riskLevel === "critical").length;
  const active = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  const alerts = {
    operations: active,
    crisis: critical,
    archive: completed,
    calendar: calendarConnected ? calendarEvents.length : 0, // 📅 NEW
  };

  if (authLoading || !user || !dataReady) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ background: "#0A0A0A" }}
      >
        <div className="text-center">
          <div className="guardian-loader mx-auto mb-4" style={{ width: 40, height: 40 }} />
          <div style={{ 
            color: "#6B7280", 
            fontSize: "10px", 
            fontFamily: "JetBrains Mono, monospace", 
            letterSpacing: "0.2em" 
          }}>
            INITIALIZING MISSION CONTROL...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ background: "#0A0A0A" }}>
        <MissionConsole alerts={alerts} />
        <main className="flex-1 overflow-y-auto" style={{ background: "#0D0D0D" }}>
          {children}
        </main>
      </div>
      <ProfilerWrapper />
      <OnboardingWrapper />
      <NotificationPrompt />
      <VoiceControl />
    </>
  );
}