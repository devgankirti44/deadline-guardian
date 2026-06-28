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
import { Menu, Shield } from "lucide-react";

export default function AppShell({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const { isConnected: calendarConnected, events: calendarEvents } = useGoogleCalendar(user?.uid);

  useGuardianWatcher(tasks);

  useEffect(() => {
    if (user && !tasksLoading) {
      const timer = setTimeout(() => {
        setDataReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, tasksLoading, tasks]);

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  const critical = tasks.filter((t) => !t.completed && t.riskLevel === "critical").length;
  const active = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  const alerts = {
    operations: active,
    crisis: critical,
    archive: completed,
    calendar: calendarConnected ? calendarEvents.length : 0,
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
      {/* MOBILE TOP BAR — only visible on mobile */}
      <div 
        className="mobile-top-bar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: '#0A0A0A',
          borderBottom: '1px solid rgba(245,158,11,0.15)',
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F59E0B',
          }}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Shield size={16} color="#F59E0B" />
          <span style={{
            color: '#F59E0B',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            letterSpacing: '0.15em',
          }}>
            DEADLINE GUARDIAN
          </span>
        </div>

        <div className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ 
            background: "linear-gradient(135deg, #F59E0B, #D97706)", 
            color: "#0D0D0D", 
            fontSize: "13px", 
            fontWeight: "700" 
          }}
        >
          {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      <div className="flex h-screen overflow-hidden app-shell-container" style={{ background: "#0A0A0A" }}>
        <MissionConsole 
          alerts={alerts} 
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        {/* Overlay when mobile menu is open */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 998,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        <main 
          className="flex-1 overflow-y-auto main-content" 
          style={{ background: "#0D0D0D" }}
        >
          {children}
        </main>
      </div>

      <ProfilerWrapper />
      <OnboardingWrapper />
      <NotificationPrompt />
      <VoiceControl />

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-top-bar {
            display: flex !important;
          }
          .main-content {
            padding-top: 56px !important;
          }
        }
      `}</style>
    </>
  );
}